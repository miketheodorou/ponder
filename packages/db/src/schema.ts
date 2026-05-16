import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  primaryKey,
  unique
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const quotes = pgTable('quotes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  text: text('text').notNull(),
  bookTitle: text('book_title').notNull(),
  authorName: text('author_name').notNull(),
  pageNumber: integer('page_number'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  quoteId: uuid('quote_id')
    .notNull()
    .references(() => quotes.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const themes = pgTable(
  'themes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  (table) => [unique().on(table.userId, table.name)]
);

export const quoteThemes = pgTable(
  'quote_themes',
  {
    quoteId: uuid('quote_id')
      .notNull()
      .references(() => quotes.id, { onDelete: 'cascade' }),
    themeId: uuid('theme_id')
      .notNull()
      .references(() => themes.id, { onDelete: 'cascade' })
  },
  (table) => [primaryKey({ columns: [table.quoteId, table.themeId] })]
);

export const quotesRelations = relations(quotes, ({ many }) => ({
  quoteThemes: many(quoteThemes),
  journalEntries: many(journalEntries)
}));

export const themesRelations = relations(themes, ({ many }) => ({
  quoteThemes: many(quoteThemes)
}));

export const quoteThemesRelations = relations(quoteThemes, ({ one }) => ({
  quote: one(quotes, { fields: [quoteThemes.quoteId], references: [quotes.id] }),
  theme: one(themes, { fields: [quoteThemes.themeId], references: [themes.id] })
}));

export const journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  quote: one(quotes, { fields: [journalEntries.quoteId], references: [quotes.id] })
}));

export type Quote = typeof quotes.$inferInsert;
export type Theme = typeof themes.$inferInsert;
export type JournalEntry = typeof journalEntries.$inferInsert;
