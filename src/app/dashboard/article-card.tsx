import type { ArticleWithMeta } from "@/lib/articles";
import { categoryColor } from "./category-color";
import { DeleteArticleButton } from "./delete-article-button";
import { SaveNotionButton } from "./save-notion-button";

const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function formatDate(date: Date) {
  const p = Object.fromEntries(
    dateFormat.formatToParts(date).map((x) => [x.type, x.value]),
  );
  return `${p.year}.${p.month}.${p.day}`;
}

export function ArticleCard({ article }: { article: ArticleWithMeta }) {
  const date = article.publishedAt ?? article.createdAt;
  const sources = [
    { sourceName: article.sourceName, link: article.link },
    ...article.sources,
  ];

  return (
    // 카드 전체가 원문 링크(제목의 stretched link)다. 그 위에서 따로 눌러야 하는 요소
    // (삭제, 출처, 원문 보기, Notion 저장)는 relative z-10 으로 올려 둔다.
    <article className="group relative flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md has-[h2_a:focus-visible]:outline-2 has-[h2_a:focus-visible]:outline-offset-2 has-[h2_a:focus-visible]:outline-indigo-500 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700">
      <div className="flex items-center justify-between gap-2">
        {article.categoryName && article.categoryId !== null ? (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColor(article.categoryId).tag}`}
          >
            {article.categoryName}
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-neutral-800 dark:text-neutral-400">
            미분류
          </span>
        )}
        <div className="-mr-1.5 flex items-center gap-1">
          <time
            dateTime={date.toISOString()}
            className="text-xs tabular-nums text-slate-500 dark:text-neutral-400"
          >
            {formatDate(date)}
          </time>
          {/* 평소에는 숨겼다가 카드에 hover·포커스가 오면 나타난다. 터치 기기는 항상 보인다. */}
          <span className="relative z-10 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 motion-reduce:transition-none [@media(hover:none)]:opacity-100">
            <DeleteArticleButton articleId={article.id} />
          </span>
        </div>
      </div>

      <h2 className="mt-4 line-clamp-2 break-keep text-[17px] font-semibold leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-indigo-700 motion-reduce:transition-none dark:text-neutral-50 dark:group-hover:text-indigo-300">
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="outline-none after:absolute after:inset-0 after:rounded-xl"
        >
          {article.titleKo}
        </a>
      </h2>
      <p className="mb-5 mt-2.5 line-clamp-4 break-keep text-sm leading-[1.7] text-slate-700 dark:text-neutral-300">
        {article.summaryKo}
      </p>

      <div className="relative z-10 mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-slate-100 pt-4 dark:border-neutral-800">
        <span className="text-xs text-slate-500 dark:text-neutral-400">
          {sources.map((s, i) => (
            <span key={s.link}>
              {i > 0 && " · "}
              <a
                href={s.link}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-slate-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:hover:text-neutral-100"
              >
                {s.sourceName}
              </a>
            </span>
          ))}
        </span>
        <div className="flex shrink-0 items-center gap-3">
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group/link inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-indigo-400"
          >
            원문 보기
            <svg
              viewBox="0 0 16 16"
              className="size-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 motion-reduce:transition-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 11l6-6M6 5h5v5" />
            </svg>
          </a>
          <SaveNotionButton
            articleId={article.id}
            savedUrl={article.notionPageUrl}
          />
        </div>
      </div>
    </article>
  );
}
