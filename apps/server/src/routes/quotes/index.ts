import { Hono } from 'hono';

const quotesRouter = new Hono();

quotesRouter.get('/', (c) => {
  return c.text('Hello Quotes!');
});

export default quotesRouter;
