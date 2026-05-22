# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# From repo root (Turborepo)
pnpm dev                        # start all apps
pnpm build                      # build all apps
pnpm lint                       # lint all packages
pnpm check-types                # type-check all packages
pnpm format                     # prettier format

# Run a single app
pnpm --filter server dev
pnpm --filter ponder-mobile dev

# Database (runs against @ponder/db)
pnpm db:push                    # push schema to Neon
pnpm db:studio                  # open Drizzle Studio
pnpm db:seed                    # seed the database
```

Environment variables needed:
- `packages/db/.env` — `DATABASE_URL` (Neon PostgreSQL connection string)
- `apps/server/.env` — `DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`
- `apps/mobile` — `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`, `EXPO_PUBLIC_API_URL` (prod only)

## Architecture

This is a pnpm + Turborepo monorepo:

```
apps/
  server/       Hono API (Node.js, port 3000)
  mobile/       Expo / React Native app (expo-router)
packages/
  db/           Drizzle ORM schema, queries, and db client (@ponder/db)
  eslint-config/
  typescript-config/
```

### `packages/db` — shared data layer

Exports three entry points:
- `@ponder/db` — the `drizzle` db client instance
- `@ponder/db/schema` — table definitions + exported types (`Quote`, `Theme`, `JournalEntry`)
- `@ponder/db/queries` — all query functions (`getUserQuotes`, `getQuoteById`, `getTodaysQuote`, `getJournalEntryById`)

Always import types from `@ponder/db/schema`. Never redeclare shapes that mirror schema types.

### `apps/server` — Hono API

- All routes are protected by `clerkMiddleware()` + a `requireAuth` middleware that sets `c.var.userId`.
- Route handlers use `AuthedEnv` as the Hono generic so `c.var.userId` is typed.
- Routers live in `src/routes/<resource>/index.ts` and are mounted in `src/index.ts`.
- Queries are called directly from `@ponder/db/queries` — no ORM logic in route files.

### `apps/mobile` — Expo app

**Routing** (`apps/mobile/app/`): expo-router file-based routing with two protected route groups:
- `(auth)/` — sign-in / sign-up screens; guarded by `Stack.Protected guard={!isSignedIn}`
- `(app)/` — main app; guarded by `Stack.Protected guard={!!isSignedIn}`
- The auth↔app swap is driven by Clerk's `isSignedIn` in the root `_layout.tsx`.

**API layer** (`apps/mobile/api/`): `ky` HTTP client in `client.ts`. Clerk's token is injected via `registerAuthTokenGetter` called from the root layout — this bridges Clerk's React hook boundary to the module-level `ky` singleton. API URL resolves from Metro's `hostUri` in dev so iOS Simulator, Android Emulator, and physical devices work without per-platform config.

**Theme** (`apps/mobile/theme/`): Custom design token system. All colors, typography, spacing, etc. are sourced from `tokens.ts`. Use `useTheme()` for runtime access. Two fonts — DM Sans (sans) and Lora (serif) — loaded via `expo-google-fonts`. Resolve font family strings with `resolveFont({ family, weight })`.

**State**: TanStack Query (`@tanstack/react-query`) for server state. The `queryClient` singleton lives in `apps/mobile/lib/query-client.ts`.

**Mock data** (`apps/mobile/data/quotes.ts`): The `(app)` screens currently render against seeded mock data. This is intentional — the real TanStack Query + AsyncStorage data layer has not landed yet. Wire new screens to mock data; don't add session stores or local persistence yet.
