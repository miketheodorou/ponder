import {
  deleteJournalEntry,
  getJournalEntryById,
  updateJournalEntry
} from '@ponder/db/queries';
import { updateJournalEntrySchema } from '@ponder/db/validators';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import type { AuthedEnv } from '../../types';

const journalEntriesRouter = new Hono<AuthedEnv>();

journalEntriesRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const journalEntry = await getJournalEntryById(id);
  return c.json({ data: journalEntry });
});

journalEntriesRouter.put(
  '/:id',
  zValidator('json', updateJournalEntrySchema),
  async (c) => {
    const updated = await updateJournalEntry(
      c.req.param('id'),
      c.var.userId,
      c.req.valid('json')
    );
    if (!updated) return c.json({ error: 'Not found' }, 404);
    return c.json({ data: updated });
  }
);

journalEntriesRouter.delete('/:id', async (c) => {
  const deleted = await deleteJournalEntry(c.req.param('id'), c.var.userId);
  if (!deleted) return c.json({ error: 'Not found' }, 404);
  return c.json({ data: deleted });
});

export default journalEntriesRouter;
