import { eq } from 'drizzle-orm';
import { db } from './index';
import { quotes } from './schema';

export function getQuoteById(id: string) {
  return db.query.quotes.findFirst({
    where: (quotes, { eq }) => eq(quotes.id, id)
  });
}

export function getUserQuotes(userId: string) {
  return db.select().from(quotes).where(eq(quotes.userId, userId));
}
