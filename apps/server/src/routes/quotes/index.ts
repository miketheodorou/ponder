import {
  getQuoteById,
  getTodaysQuote,
  getUserQuotes
} from '@ponder/db/queries';
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

export default quotesRouter;
