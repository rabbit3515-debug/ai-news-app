import type { ArticleWithMeta } from "@/lib/articles";
import { categoryColor } from "./category-color";
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
    <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
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
        <time
          dateTime={date.toISOString()}
          className="text-xs text-slate-500 dark:text-neutral-400"
        >
          {formatDate(date)}
        </time>
      </div>

      <h2 className="mt-3 line-clamp-2 text-base font-semibold leading-snug text-slate-900 dark:text-neutral-50">
        {article.titleKo}
      </h2>
      <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-slate-700 dark:text-neutral-300">
        {article.summaryKo}
      </p>

      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <span className="text-xs text-slate-500 dark:text-neutral-400">
          {sources.map((s, i) => (
            <span key={s.link}>
              {i > 0 && " · "}
              <a
                href={s.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
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
            className="text-sm font-medium text-indigo-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-indigo-400"
          >
            원문 보기
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
