import 'dotenv/config';
import { db } from './index';
import { quotes, journalEntries, themes, quoteThemes } from './schema';

const SEED_USER_ID = process.env.SEED_USER_ID!;

async function seed() {
  await db.delete(quoteThemes);
  await db.delete(journalEntries);
  await db.delete(quotes);
  await db.delete(themes);

  const [quote] = await db
    .insert(quotes)
    .values({
      userId: SEED_USER_ID,
      text: 'You have power over your mind, not outside events. Realize this, and you will find strength.',
      bookTitle: 'Meditations',
      authorName: 'Marcus Aurelius',
      pageNumber: 42
    })
    .returning();

  const [theme] = await db
    .insert(themes)
    .values({
      userId: SEED_USER_ID,
      name: 'stoicism'
    })
    .returning();

  await db.insert(quoteThemes).values({
    quoteId: quote.id,
    themeId: theme.id
  });

  await db.insert(journalEntries).values({
    quoteId: quote.id,
    userId: SEED_USER_ID,
    content:
      'This quote reminds me to focus on what I can control — my thoughts, reactions, and effort — rather than fixating on outcomes outside my reach.'
  });

  console.log('Seeded successfully');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
