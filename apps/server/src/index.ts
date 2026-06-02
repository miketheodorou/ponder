// Local development entry point.
//
// `dotenv/config` MUST be imported first so DATABASE_URL etc. are populated
// before `./app` (which transitively constructs the @ponder/db client) loads.
//
// In production this file is NOT used — Netlify imports the app directly via
// netlify/functions/api.mts and provides env vars through the dashboard.
import 'dotenv/config';
import { serve } from '@hono/node-server';
import app from './app';

serve(
  {
    fetch: app.fetch,
    port: 3000
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}/api`);
  }
);
