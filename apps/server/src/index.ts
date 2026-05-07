import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import 'dotenv/config';
import { requireAuth } from './middleware/clerk';
import quotesRouter from './routes/quotes';
import { clerkMiddleware } from '@clerk/hono';

const app = new Hono();

app.use('*', clerkMiddleware());
app.use('*', requireAuth);

app.route('/quotes', quotesRouter);

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

serve(
  {
    fetch: app.fetch,
    port: 3000
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
