import {
  deleteQuote,
  getQuoteById,
  getTodaysQuote,
  getUserQuotes,
  updateQuote
} from '@ponder/db/queries';
import { updateQuoteSchema } from '@ponder/db/validators';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import type { AuthedEnv } from '../../types';

const quotesRouter = new Hono<AuthedEnv>();

quotesRouter.get('/', async (c) => {
  const quotesData = await getUserQuotes(c.var.userId);
  return c.json({ data: quotesData });
});

quotesRouter.get('/today', async (c) => {
  const quote = await getTodaysQuote(c.var.userId);
  return c.json({ data: quote });
});

quotesRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const quote = await getQuoteById(id);
  return c.json({ data: quote });
});

quotesRouter.put('/:id', zValidator('json', updateQuoteSchema), async (c) => {
  const updated = await updateQuote(
    c.req.param('id'),
    c.var.userId,
    c.req.valid('json')
  );
  if (!updated) return c.json({ error: 'Not found' }, 404);
  return c.json({ data: updated });
});

quotesRouter.delete('/:id', async (c) => {
  const deleted = await deleteQuote(c.req.param('id'), c.var.userId);
  if (!deleted) return c.json({ error: 'Not found' }, 404);
  return c.json({ data: deleted });
});

export default quotesRouter;
