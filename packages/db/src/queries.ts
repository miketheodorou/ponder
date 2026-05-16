import { eq, getTableColumns, sql } from 'drizzle-orm';
import { db } from './index';
import { journalEntries, quotes, quoteThemes, themes } from './schema';

const { userId: _userId, ...quoteColumns } = getTableColumns(quotes);
const { userId: _userId2, ...journalEntryColumns } =
  getTableColumns(journalEntries);

const themesArray = sql<string[]>`
  coalesce(array_agg(${themes.name}) filter (where ${themes.name} is not null), '{}')
`.as('themes');

type JournalEntryPreview = {
  id: string;
  preview: string;
  createdAt: string;
};

const journalEntriesPreview = sql<JournalEntryPreview[]>`
  (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', je.id,
          'preview', left(je.content, 140),
          'createdAt', je.created_at
        )
        order by je.created_at desc
      ),
      '[]'::jsonb
    )
    from ${journalEntries} je
    where je.quote_id = ${quotes.id}
  )
`.as('journal_entries');

export function getQuoteById(id: string) {
  return db
    .select({
      ...quoteColumns,
      themes: themesArray,
      journalEntries: journalEntriesPreview
    })
    .from(quotes)
    .leftJoin(quoteThemes, eq(quoteThemes.quoteId, quotes.id))
    .leftJoin(themes, eq(themes.id, quoteThemes.themeId))
    .where(eq(quotes.id, id))
    .groupBy(quotes.id)
    .then((rows) => rows[0]);
}

export function getJournalEntryById(id: string) {
  return db
    .select(journalEntryColumns)
    .from(journalEntries)
    .where(eq(journalEntries.id, id))
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
