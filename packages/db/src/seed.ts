import 'dotenv/config';
import { db } from './index';
import { quotes, tags, quoteTags } from './schema';

const SEED_USER_ID = process.env.SEED_USER_ID!;

async function seed() {
  await db.delete(quoteTags);
  await db.delete(quotes);
  await db.delete(tags);

  const [quote] = await db
    .insert(quotes)
    .values({
      userId: SEED_USER_ID,
      text: 'You have power over your mind, not outside events. Realize this, and you will find strength.',
      bookTitle: 'Meditations',
      authorName: 'Marcus Aurelius',
      pageNumber: 42,
      notes: 'A reminder to focus on what is within my control.'
    })
    .returning();

  const [tag] = await db
    .insert(tags)
    .values({
      userId: SEED_USER_ID,
      name: 'stoicism'
    })
    .returning();

  await db.insert(quoteTags).values({
    quoteId: quote.id,
    tagId: tag.id
  });

  console.log('Seeded successfully');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
