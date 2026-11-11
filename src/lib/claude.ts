import Anthropic from "@anthropic-ai/sdk";
import type { Category } from "@/db/schema";
import type { FeedItem } from "@/lib/rss";

// 번역·요약·분류는 가벼운 작업이라 속도/비용을 우선해 Haiku 를 쓴다. 품질이 모자라면 여기만 바꾼다.
const MODEL = "claude-haiku-5-5";
const BATCH_SIZE = 10;

export type Enriched = {
  titleKo: string;
  summaryKo: string;
  // 매핑에 실패하면 null(미분류)
  categoryId: number | null;
};

const client = new Anthropic();

const SCHEMA = {
  type: "object",
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        properties: {
          index: { type: "integer" },
          titleKo: { type: "string" },
          summaryKo: { type: "string" },
          category: { type: "string" },
        },
        required: ["index", "titleKo", "summaryKo", "category"],
        additionalProperties: false,
      },
    },
  },
  required: ["results"],
  additionalProperties: false,
} as const;

function buildPrompt(items: FeedItem[], categories: Category[]) {
  const categoryList = categories
    .map((c) => `- ${c.name}${c.description ? `: ${c.description}` : ""}`)
    .join("\n");
  const articles = items.map((item, index) => ({
    index,
    title: item.originalTitle,
    summary: item.summary,
  }));

  return `다음 AI 뉴스 기사들을 처리해 주세요. 각 기사마다:
1. titleKo: 제목을 자연스러운 한국어로 번역 (고유명사·제품명은 원문 유지 가능)
2. summaryKo: 내용을 한국어 2~3문장으로 요약. 주어진 제목·요약에 없는 사실은 추가하지 말 것
3. category: 아래 카테고리 이름 중 정확히 하나를 그대로 선택. 애매하면 "기타"

카테고리:
${categoryList}

기사 (JSON):
${JSON.stringify(articles)}

모든 기사에 대해 index 를 그대로 포함해 results 배열로 답하세요.`;
}

async function enrichBatch(
  items: FeedItem[],
  categories: Category[],
): Promise<(Enriched | null)[]> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    output_config: {
      // low 로 두면 기사 10건 중 1건만 답하고 요약·카테고리를 비운 채 끝내는 일이 있었다.
      effort: "medium",
      format: { type: "json_schema", schema: SCHEMA },
    },
    messages: [{ role: "user", content: buildPrompt(items, categories) }],
  });
  if (response.stop_reason !== "end_turn") throw new Error("incomplete");

  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") throw new Error("no text");
  const parsed = JSON.parse(block.text) as {
    results: {
      index: number;
      titleKo: string;
      summaryKo: string;
      category: string;
    }[];
  };

  const idByName = new Map(categories.map((c) => [c.name, c.id]));
  const out: (Enriched | null)[] = items.map(() => null);
  for (const r of parsed.results) {
    if (!Number.isInteger(r.index) || r.index < 0 || r.index >= items.length)
      continue;
    const titleKo = r.titleKo?.trim();
    const summaryKo = r.summaryKo?.trim();
    if (!titleKo || !summaryKo) continue;
    out[r.index] = {
      titleKo,
      summaryKo,
      categoryId: idByName.get(r.category?.trim()) ?? null,
    };
  }
  return out;
}

// items 와 같은 순서로 결과를 돌려준다. 배치가 실패하거나 응답에서 빠진 기사는 null 이다.
export async function enrichItems(
  items: FeedItem[],
  categories: Category[],
): Promise<(Enriched | null)[]> {
  const batches: FeedItem[][] = [];
  for (let i = 0; i < items.length; i += BATCH_SIZE)
    batches.push(items.slice(i, i + BATCH_SIZE));

  const settled = await Promise.allSettled(
    batches.map((batch) => enrichBatch(batch, categories)),
  );
  return settled.flatMap((r, i) => {
    if (r.status === "fulfilled") {
      const missing = r.value.filter((e) => e === null).length;
      if (missing > 0)
        console.error(
          `[claude] 배치 ${i}: ${batches[i].length}건 중 ${missing}건 응답 누락`,
        );
      return r.value;
    }
    console.error(`[claude] 배치 ${i} 실패:`, r.reason);
    return batches[i].map(() => null);
  });
}
