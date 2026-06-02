import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { requireAuth } from './middleware/clerk';
import journalEntriesRouter from './routes/journal-entries';
import quotesRouter from './routes/quotes';

// The app is mounted under `/api` so it can share a domain with a future
// landing page / static site. This base path applies in BOTH local dev
// (http://localhost:3000/api/...) and production (https://<site>/api/...),
// keeping the two environments identical.
const app = new Hono().basePath('/api');

// Request logging first, so every request (including 401s and the health
// check) is logged. On Netlify, console output lands in the function logs.
app.use('*', logger());

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

// Centralized error handler: log the failure with request context (so issues
// like a failed DB query surface in the function logs) and return structured
// JSON instead of Hono's default plain-text "Internal Server Error".
app.onError((err, c) => {
  console.error(`[api] ${c.req.method} ${c.req.path} failed:`, err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

export default app;
