import { Hono } from 'hono';
import { clerkMiddleware } from '@clerk/hono';
import { requireAuth } from './middleware/clerk';
import journalEntriesRouter from './routes/journal-entries';
import quotesRouter from './routes/quotes';

// The app is mounted under `/api` so it can share a domain with a future
// landing page / static site. This base path applies in BOTH local dev
// (http://localhost:3000/api/...) and production (https://<site>/api/...),
// keeping the two environments identical.
const app = new Hono().basePath('/api');

app.use('*', clerkMiddleware());
app.use('*', requireAuth);

app.route('/journal-entries', journalEntriesRouter);
app.route('/quotes', quotesRouter);

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

export default app;
