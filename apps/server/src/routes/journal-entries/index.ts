import { getJournalEntryById } from '@ponder/db/queries';
import { Hono } from 'hono';
import type { AuthedEnv } from '../../types';

const journalEntriesRouter = new Hono<AuthedEnv>();

journalEntriesRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const journalEntry = await getJournalEntryById(id);
  return c.json({ data: journalEntry });
});

export default journalEntriesRouter;
