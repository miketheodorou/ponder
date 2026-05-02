import { db } from './index'
import { users, quotes, tags, quoteTags } from './schema'

async function seed() {
  await db.delete(quoteTags)
  await db.delete(quotes)
  await db.delete(tags)
  await db.delete(users)

  const [user] = await db
    .insert(users)
    .values({
      name: 'Michael',
      email: 'michael@example.com',
    })
    .returning()

  const [quote] = await db
    .insert(quotes)
    .values({
      userId: user.id,
      text: 'You have power over your mind, not outside events. Realize this, and you will find strength.',
      bookTitle: 'Meditations',
      authorName: 'Marcus Aurelius',
      pageNumber: 42,
      notes: 'A reminder to focus on what is within my control.',
    })
    .returning()

  const [tag] = await db
    .insert(tags)
    .values({
      userId: user.id,
      name: 'stoicism',
    })
    .returning()

  await db.insert(quoteTags).values({
    quoteId: quote.id,
    tagId: tag.id,
  })

  console.log('Seeded successfully')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
