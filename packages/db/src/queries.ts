import { eq, getTableColumns, sql } from 'drizzle-orm';
import { db } from './index';
import { quotes, quoteThemes, themes } from './schema';

const { userId: _userId, ...quoteColumns } = getTableColumns(quotes);

const themesArray = sql<string[]>`
  coalesce(array_agg(${themes.name}) filter (where ${themes.name} is not null), '{}')
`.as('themes');

export function getQuoteById(id: string) {
  return db
    .select({ ...quoteColumns, themes: themesArray })
    .from(quotes)
    .leftJoin(quoteThemes, eq(quoteThemes.quoteId, quotes.id))
    .leftJoin(themes, eq(themes.id, quoteThemes.themeId))
    .where(eq(quotes.id, id))
    .groupBy(quotes.id)
    .then((rows) => rows[0]);
}

export function getUserQuotes(userId: string) {
  return db
    .select({ ...quoteColumns, themes: themesArray })
    .from(quotes)
    .leftJoin(quoteThemes, eq(quoteThemes.quoteId, quotes.id))
    .leftJoin(themes, eq(themes.id, quoteThemes.themeId))
    .where(eq(quotes.userId, userId))
    .groupBy(quotes.id);
}
