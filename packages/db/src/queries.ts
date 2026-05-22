import { and, desc, eq, getTableColumns, sql } from 'drizzle-orm';
import { db } from './index';
import { journalEntries, quotes, quoteThemes, themes } from './schema';
import type {
  CreateJournalEntryInput,
  CreateQuoteInput,
  UpdateJournalEntryInput,
  UpdateQuoteInput
} from './validators';

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

export function getTodaysQuote(userId: string) {
  return db
    .select({
      id: quotes.id,
      text: quotes.text,
      bookTitle: quotes.bookTitle,
      authorName: quotes.authorName
    })
    .from(quotes)
    .where(eq(quotes.userId, userId))
    .orderBy(desc(quotes.createdAt))
    .limit(1)
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

function definedEntries<T extends object>(input: T) {
  return Object.fromEntries(
    Object.entries(input).filter(([, v]) => v !== undefined)
  );
}

export async function createQuote(
  userId: string,
  fields: CreateQuoteInput
) {
  const rows = await db
    .insert(quotes)
    .values({ ...fields, userId })
    .returning(quoteColumns);
  return rows[0];
}

export async function createJournalEntry(
  userId: string,
  quoteId: string,
  fields: CreateJournalEntryInput
) {
  const parentQuote = await db
    .select({ id: quotes.id })
    .from(quotes)
    .where(and(eq(quotes.id, quoteId), eq(quotes.userId, userId)))
    .then((rows) => rows[0]);
  if (!parentQuote) return undefined;
  const rows = await db
    .insert(journalEntries)
    .values({ ...fields, userId, quoteId })
    .returning(journalEntryColumns);
  return rows[0];
}

export async function updateQuote(
  id: string,
  userId: string,
  fields: UpdateQuoteInput
) {
  const patch = definedEntries(fields);
  const where = and(eq(quotes.id, id), eq(quotes.userId, userId));
  if (Object.keys(patch).length === 0) {
    return db
      .select(quoteColumns)
      .from(quotes)
      .where(where)
      .then((rows) => rows[0]);
  }
  const rows = await db
    .update(quotes)
    .set(patch)
    .where(where)
    .returning(quoteColumns);
  return rows[0];
}

export async function updateJournalEntry(
  id: string,
  userId: string,
  fields: UpdateJournalEntryInput
) {
  const patch = definedEntries(fields);
  const where = and(
    eq(journalEntries.id, id),
    eq(journalEntries.userId, userId)
  );
  if (Object.keys(patch).length === 0) {
    return db
      .select(journalEntryColumns)
      .from(journalEntries)
      .where(where)
      .then((rows) => rows[0]);
  }
  const rows = await db
    .update(journalEntries)
    .set(patch)
    .where(where)
    .returning(journalEntryColumns);
  return rows[0];
}

export async function deleteQuote(id: string, userId: string) {
  const rows = await db
    .delete(quotes)
    .where(and(eq(quotes.id, id), eq(quotes.userId, userId)))
    .returning(quoteColumns);
  return rows[0];
}

export async function deleteJournalEntry(id: string, userId: string) {
  const rows = await db
    .delete(journalEntries)
    .where(
      and(eq(journalEntries.id, id), eq(journalEntries.userId, userId))
    )
    .returning(journalEntryColumns);
  return rows[0];
}
