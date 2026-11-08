import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const categories = pgTable(
  "categories",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id").notNull(),
    name: text().notNull(),
    // Claude에게 전달하는 분류 힌트
    description: text(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique("categories_user_name_uq").on(t.userId, t.name)],
);

export const articles = pgTable(
  "articles",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id").notNull(),
    sourceName: text("source_name").notNull(),
    // 정규화된 원문 URL (중복 방지 키)
    link: text().notNull(),
    originalTitle: text("original_title").notNull(),
    titleKo: text("title_ko").notNull(),
    summaryKo: text("summary_ko").notNull(),
    // 카테고리 삭제 시 null → '미분류'
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    publishedAt: timestamp("published_at"),
    imageUrl: text("image_url"),
    notionPageUrl: text("notion_page_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    unique("articles_user_link_uq").on(t.userId, t.link),
    index("articles_user_category_idx").on(t.userId, t.categoryId),
    index("articles_user_published_idx").on(t.userId, t.publishedAt),
  ],
);

// 같은 사건을 다룬 다른 출처의 기사들 (카드 한 장에 출처를 모두 표기)
export const articleSources = pgTable(
  "article_sources",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    articleId: integer("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    sourceName: text("source_name").notNull(),
    link: text().notNull(),
  },
  (t) => [unique("article_sources_article_link_uq").on(t.articleId, t.link)],
);

export type Category = typeof categories.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type ArticleSource = typeof articleSources.$inferSelect;
