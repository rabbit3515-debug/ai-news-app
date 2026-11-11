import Parser from "rss-parser";
import { normalizeUrl } from "@/lib/url";

export const FEEDS = [
  {
    name: "TechCrunch AI",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
  {
    name: "The Verge AI",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
  },
] as const;

const MAX_PER_FEED = 20;
const WINDOW_MS = 24 * 60 * 60 * 1000;
const SUMMARY_MAX = 300;

export type FeedItem = {
  sourceName: string;
  link: string; // 정규화된 URL
  originalTitle: string;
  publishedAt: Date;
  summary: string;
  imageUrl: string | null;
};

export type FetchFeedsResult = {
  items: FeedItem[];
  failedSources: string[];
};

type CustomItem = {
  "media:content"?: { $?: { url?: string } };
  "media:thumbnail"?: { $?: { url?: string } };
};

const parser = new Parser<Record<string, never>, CustomItem>({
  timeout: 10_000,
  customFields: {
    item: ["media:content", "media:thumbnail"],
  },
});

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text: string, max: number) {
  return text.length <= max ? text : `${text.slice(0, max).trimEnd()}…`;
}

async function fetchFeed(
  feed: (typeof FEEDS)[number],
  since: number,
): Promise<FeedItem[]> {
  const parsed = await parser.parseURL(feed.url);
  const items: FeedItem[] = [];

  for (const entry of parsed.items.slice(0, MAX_PER_FEED)) {
    const link = entry.link ? normalizeUrl(entry.link) : null;
    const title = entry.title?.trim();
    const published = entry.isoDate ?? entry.pubDate;
    if (!link || !title || !published) continue;

    const publishedAt = new Date(published);
    // 날짜를 읽을 수 없거나 24시간보다 오래된 기사는 건너뛴다.
    if (Number.isNaN(publishedAt.getTime()) || publishedAt.getTime() < since)
      continue;

    const rawSummary =
      entry.contentSnippet ?? entry.summary ?? entry.content ?? "";
    items.push({
      sourceName: feed.name,
      link,
      originalTitle: title,
      publishedAt,
      summary: truncate(stripHtml(rawSummary), SUMMARY_MAX),
      imageUrl:
        entry.enclosure?.url ??
        entry["media:content"]?.$?.url ??
        entry["media:thumbnail"]?.$?.url ??
        null,
    });
  }
  return items;
}

// 두 피드를 병렬로 수집한다. 한 피드가 실패해도 나머지는 정상 처리한다.
export async function fetchRecentFeedItems(): Promise<FetchFeedsResult> {
  const since = Date.now() - WINDOW_MS;
  const results = await Promise.allSettled(
    FEEDS.map((feed) => fetchFeed(feed, since)),
  );

  const items: FeedItem[] = [];
  const failedSources: string[] = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") items.push(...r.value);
    else failedSources.push(FEEDS[i].name);
  });
  return { items, failedSources };
}
