import type { Config, Context } from '@netlify/functions';
import app from '../../apps/server/src/app';

// Netlify Functions v2 hand us a Web-standard `Request` and return a
// `Response` — the exact shape Hono's `app.fetch` already implements, so we
// just forward the request. No Hono adapter package is needed.
//
// The Netlify `context` is passed as Hono's `env` binding so route handlers
// can reach it via `c.env` later if we ever need geo/IP/etc.
export default async (req: Request, context: Context) => {
  return app.fetch(req, context);
};

// In-code routing (preferred over netlify.toml redirects for Functions v2).
// Every request to /api or /api/* is served by this function; the app's
// basePath('/api') means the paths line up without any rewriting.
export const config: Config = {
  path: ['/api', '/api/*']
};
