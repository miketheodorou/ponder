import { Hono } from 'hono';
import { requireAuth } from './middleware/clerk';
import journalEntriesRouter from './routes/journal-entries';
import quotesRouter from './routes/quotes';

// The app is mounted under `/api` so it can share a domain with a future
// landing page / static site. This base path applies in BOTH local dev
// (http://localhost:3000/api/...) and production (https://<site>/api/...),
// keeping the two environments identical.
const app = new Hono().basePath('/api');

// Public health check — registered before requireAuth so it stays
// unauthenticated. Used for uptime monitoring and to confirm a deploy is live
// without needing a token.
app.get('/health', (c) => c.json({ status: 'ok' }));

app.use('*', requireAuth);

app.route('/journal-entries', journalEntriesRouter);
app.route('/quotes', quotesRouter);

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

export default app;
