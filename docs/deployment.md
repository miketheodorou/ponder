# Server deployment (Netlify Functions)

The `apps/server` Hono API runs on **Netlify Functions** (Node.js serverless) on
the site **`ponder-app`** (`ponder-app.netlify.app`), deployed from GitHub
`miketheodorou/ponder`. This is the operational runbook; the *why* behind the
non-obvious choices is in [Design decisions](#design-decisions).

## At a glance

| | |
|---|---|
| Platform | Netlify Functions (Node serverless) — **not** Edge/Deno |
| Site | `ponder-app` (team `miketheo423`) |
| Production URL | `https://ponder-app.netlify.app/api` |
| Staging URL | `https://develop--ponder-app.netlify.app/api` |
| Runtime entry | `netlify/functions/api.mts` → forwards to `apps/server/src/app.ts` (`app.fetch`) |
| DB | Neon Postgres, **pooled** (`-pooler`) endpoint |
| Auth | Clerk **dev keys**, token-only (`@clerk/backend`) |

## Branch → environment model

| Branch | Netlify context | Deploys to |
|---|---|---|
| `main` | production | `ponder-app.netlify.app` |
| `develop` | branch deploy (staging) | `develop--ponder-app.netlify.app` |

Push to `main` → production build. Push to `develop` → staging build. Branch
deploys for `develop` must be enabled in **Site configuration → Build & deploy →
Branches**.

Promotion flow: land + verify on `develop` (staging) first, then fast-forward
`main` to it and push.

```bash
git checkout main && git merge --ff-only develop && git push origin main
```

## Routes

| Path | Auth | Purpose |
|---|---|---|
| `GET /api/health` | public | uptime check / confirm a deploy is live without a token → `{"status":"ok"}` |
| `GET /api/quotes` | required | returns 401 without a valid Clerk session token |
| `GET /api/journal-entries` | required | — |

Everything except `/api/health` sits behind `requireAuth` and returns **401**
without a `Authorization: Bearer <clerk session token>` header.

## Environment variables

Set these in the **Netlify UI** (Site configuration → Environment variables),
**never** in `netlify.toml`. They currently live at context `all`, so prod and
`develop` share them until a separate staging DB lands.

| Var | Value |
|---|---|
| `DATABASE_URL` | Neon connection string — use the **pooled** (`-pooler`) host |
| `CLERK_SECRET_KEY` | Clerk backend secret (`sk_test_…`) |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key (`pk_test_…`) |
| `APP_ENV` | set per-context in `netlify.toml` (`production` / `staging`) — non-secret |

## How the build works

`netlify.toml` build command:

```
pnpm turbo run build --filter=server && pnpm build:fn
```

1. **`turbo run build --filter=server`** — type-checks + compiles the server. A
   deploy gate; the `dist/` output is *not* shipped. `--filter=server` keeps the
   mobile app out of the build.
2. **`build:fn`** — esbuild bundles `netlify/functions/api.mts` into a single
   self-contained `netlify/bundled/api.mjs`. **We bundle it ourselves** because
   Netlify's bundler (zisi) can't inline the symlinked raw-TS `@ponder/db`
   workspace package and leaves a bare import → `ERR_MODULE_NOT_FOUND` at
   runtime. Netlify's `[functions] directory` therefore points at
   `netlify/bundled`, not the raw source.

`netlify/bundled` and `.netlify` are gitignored.

## Local development

```bash
pnpm --filter server dev     # plain Node dev server on :3000 (src/index.ts)
pnpm netlify:dev             # runs the function exactly as in prod, on :8888/api/*
```

`netlify dev` reads env from a linked site (`netlify link`) or a root `.env`.

## Observability

- **Request logging** (`hono/logger`): every request logs `<-- GET /api/quotes`
  / `--> GET /api/quotes 401 2ms`.
- **`onError`** handler: logs `[api] GET /api/quotes failed: <error>` with
  request context and returns structured JSON (`{"error":"Internal Server Error"}`)
  instead of Hono's default plain text.
- **View logs:** Netlify → `ponder-app` → **Logs → Functions** → select the
  `api` function (real-time).

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `ERR_MODULE_NOT_FOUND: @ponder/db` at runtime | zisi didn't bundle the workspace package | ensure `build:fn` ran and `[functions] directory = "netlify/bundled"` |
| `ERR_TOO_MANY_REDIRECTS` in browser | Clerk handshake loop (dev keys + deployed domain) | already fixed — auth is token-only via `@clerk/backend`, no `clerkMiddleware` |
| 500 + `relation "…" does not exist` (42P01) | target Neon DB is missing schema | `pnpm db:push` against that database |
| `TS5011` on build | `outDir` set without `rootDir` | `apps/server/tsconfig.json` sets `rootDir: "./src"` — validate with an **emitting** `tsc`, not `--noEmit` |
| Prepared-statement errors from Postgres | Neon pooled endpoint (PgBouncer txn mode) | `packages/db` sets `prepare: false` |

## Design decisions

- **Functions, not Edge.** Edge Functions run on Deno and can't use the
  `postgres` TCP driver. Node Functions can, so the same driver works locally and
  deployed.
- **We pre-bundle the function.** See [How the build works](#how-the-build-works).
- **Pooled DB + `prepare: false`.** Neon's `-pooler` endpoint is PgBouncer in
  transaction mode, which doesn't support the prepared statements postgres.js
  uses by default. `packages/db/src/index.ts` sets `prepare: false`
  unconditionally (harmless on direct connections).
- **Token-only Clerk auth.** We use `@clerk/backend`'s `authenticateRequest`
  (returns 401), **not** `@clerk/hono`'s `clerkMiddleware` (issues a browser
  handshake redirect that loops on a dev instance + deployed domain). There's no
  Clerk *production* instance because that needs a custom domain (CNAME for the
  Frontend API), impossible on a bare `*.netlify.app`.

## Known gaps / next steps

- **No separate staging database.** `develop` shares prod's `DATABASE_URL` and
  Clerk keys. Splitting them (e.g. a Neon branch) is deferred.
- **Manual schema migrations.** Schema changes are pushed with
  `drizzle-kit push` (`pnpm db:push`) and must be applied to **every** database
  the deploys point at, or unmigrated environments 500. No automated migration
  step in the deploy yet.
- **No Clerk production instance** (custom-domain requirement — see above).
