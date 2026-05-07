import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const quotes = pgTable('quotes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  text: text('text').notNull(),
  bookTitle: text('book_title').notNull(),
  authorName: text('author_name').notNull(),
  pageNumber: integer('page_number'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const quoteTags = pgTable('quote_tags', {
  quoteId: uuid('quote_id')
    .notNull()
    .references(() => quotes.id),
  tagId: uuid('tag_id')
    .notNull()
    .references(() => tags.id)
});

export type Quote = typeof quotes.$inferInsert;
export type Tag = typeof tags.$inferInsert;
