# Ponder — Server Deployment Reference

> Portable knowledge doc for the Ponder Claude project. Self-contained — assumes
> no access to the repo. Captures **what is deployed, how, and why** so future
> conversations start with full context. Last updated 2026-06-02.

## What Ponder is

A pnpm + Turborepo monorepo:

```
apps/
  server/   Hono API (Node.js) — the deployed service
  mobile/   Expo / React Native app (consumes the API)
packages/
  db/       Drizzle ORM schema + queries + client (@ponder/db)
```

This document covers **deployment of `apps/server`** only.

## The deployment, in one paragraph

The Hono API deploys to **Netlify Functions** (Node.js serverless) on the site
**`ponder-app`** (`ponder-app.netlify.app`), from GitHub `miketheodorou/ponder`.
`main` → production, `develop` → staging branch deploy. The function is
**pre-bundled by us with esbuild** (Netlify's own bundler can't handle the
workspace package). The database is **Neon Postgres via its pooled endpoint**.
Auth is **Clerk dev keys, token-only** (no production Clerk instance). All of
this was built up incrementally, and the constraints below were learned by
hitting real failures.

## Topology

| Branch | Netlify context | URL |
|---|---|---|
| `main` | production | `https://ponder-app.netlify.app/api` |
| `develop` | staging (branch deploy) | `https://develop--ponder-app.netlify.app/api` |

Request path: **Netlify Function (`netlify/functions/api.mts`)** receives a
Web-standard `Request` and forwards it to the Hono app's `app.fetch` — no Hono
adapter package needed (Functions v2 already speak `Request`/`Response`). The
Hono app is mounted under `basePath('/api')`, and the function is configured to
serve `/api` and `/api/*`, so paths line up with no rewriting.

## Routes

| Path | Auth | Notes |
|---|---|---|
| `GET /api/health` | public | `{"status":"ok"}` — uptime / "is this deploy live" check, no token needed |
| `GET /api/quotes` | required | 401 without a Clerk session token |
| `GET /api/journal-entries` | required | — |

All routes except `/api/health` are behind a `requireAuth` middleware and return
**401** without `Authorization: Bearer <clerk session token>`.

## The five non-obvious decisions (the important part)

These are the things that aren't guessable and that broke when done the
"obvious" way:

1. **Netlify Functions, not Edge Functions.** Edge runs on Deno and can't use
   the `postgres` TCP driver. Node Functions can. Same driver works locally and
   in prod.

2. **We pre-bundle the function ourselves.** Build command is
   `pnpm turbo run build --filter=server && pnpm build:fn`, where `build:fn` runs
   esbuild to produce a single self-contained `netlify/bundled/api.mjs`, and
   Netlify's functions directory points at `netlify/bundled`. **Why:** Netlify's
   bundler (zisi) can't inline the symlinked, raw-TypeScript `@ponder/db`
   workspace package — it leaves a bare `import '@ponder/db'` that Node can't
   resolve → `ERR_MODULE_NOT_FOUND` at runtime. Do not trust Netlify to bundle
   workspace deps.

3. **Neon pooled endpoint + `prepare: false`.** The DB connection uses Neon's
   `-pooler` host (PgBouncer in transaction mode), which doesn't support the
   prepared statements postgres.js uses by default. The db client sets
   `prepare: false` unconditionally (harmless on direct connections). Without it,
   queries fail.

4. **Clerk is token-only via `@clerk/backend`, not `@clerk/hono`.** Auth verifies
   the session token with `authenticateRequest({ acceptsToken: 'session_token' })`
   and returns **401** when missing. We deliberately do **not** use `@clerk/hono`'s
   `clerkMiddleware`, which issues a browser *handshake redirect* — on dev keys +
   a deployed domain that loops forever (`ERR_TOO_MANY_REDIRECTS`,
   `dev-browser-missing`). A token API should reject, not redirect.

5. **No Clerk production instance.** Clerk prod requires a custom domain (a CNAME
   for its Frontend API), which isn't possible on a bare `*.netlify.app`. So both
   environments run Clerk **dev/test keys** (`pk_test` / `sk_test`).

## Environment variables

Set in the **Netlify UI** (Site configuration → Environment variables), never
committed. Currently scoped to context `all`, so prod and staging share them.

- `DATABASE_URL` — Neon connection string, **pooled** (`-pooler`) host
- `CLERK_SECRET_KEY` — `sk_test_…`
- `CLERK_PUBLISHABLE_KEY` — `pk_test_…`
- `APP_ENV` — set per-context in `netlify.toml` (`production` / `staging`), non-secret

## Observability

`hono/logger` logs every request (`<-- GET /api/quotes` / `--> … 401 2ms`); an
`app.onError` handler logs failures with request context and returns structured
JSON. View in Netlify → `ponder-app` → **Logs → Functions** → the `api` function.

## Mobile integration

The Expo app consumes this API under the `/api` base path. Set
`EXPO_PUBLIC_API_URL` to `<origin>/api` (e.g.
`https://ponder-app.netlify.app/api`). Gotcha already solved: the `ky` HTTP
client must use `prefix` (string concat), not `baseUrl` — `baseUrl` resolves with
`new URL(path, base)`, which drops a base segment lacking a trailing slash and
silently strips `/api`.

## Workflow for changes

1. Develop locally: `pnpm --filter server dev` (Node on :3000) or
   `pnpm netlify:dev` (function as in prod, on :8888).
2. Push to `develop` → verify on staging.
3. Promote: fast-forward `main` to `develop`, push → production.

**Validation tip learned the hard way:** type-check with an *emitting* `tsc`, not
`tsc --noEmit`. The emit-only `TS5011` (`rootDir` required when `outDir` set)
slipped past `--noEmit` and only failed in the Netlify build.

## Known gaps / future work

- **No separate staging database** — `develop` shares prod's `DATABASE_URL` and
  Clerk keys. Splitting (e.g. a Neon branch) is deferred.
- **Manual schema migrations** — applied with `drizzle-kit push` and must be run
  against every DB the deploys point at, or unmigrated environments 500 with
  `relation "…" does not exist`. No automated migration step in the deploy yet.
- **No Clerk production instance** (custom-domain requirement).

## Glossary of the failures seen (so they're recognizable)

| Error | Meaning | Resolution |
|---|---|---|
| `ERR_MODULE_NOT_FOUND: @ponder/db` | workspace package not bundled into the function | the esbuild `build:fn` pre-bundle step |
| `ERR_TOO_MANY_REDIRECTS` | Clerk handshake loop | token-only auth, no `clerkMiddleware` |
| `42P01 relation "…" does not exist` | target Neon DB missing schema | `db:push` to that DB |
| `TS5011` | `outDir` without `rootDir` | set `rootDir` in `tsconfig`; validate with emitting build |
| prepared-statement errors | Neon pooled endpoint | `prepare: false` on the postgres client |
