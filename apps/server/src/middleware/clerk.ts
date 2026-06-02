import { createClerkClient } from '@clerk/backend';
import type { MiddlewareHandler } from 'hono';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY!
});

export const requireAuth: MiddlewareHandler = async (c, next) => {
  // Authenticate as a token-based API: verify the Clerk session token from the
  // Authorization header. Unlike @clerk/hono's clerkMiddleware, we deliberately
  // DON'T honor Clerk's browser "handshake" redirect — an API should answer 401,
  // not 307 to a hosted sign-in (which loops on a dev instance served from a
  // deployed domain). The mobile app sends a Bearer token, so it authenticates
  // here; browsers and unauthenticated callers get a clean 401.
  const requestState = await clerkClient.authenticateRequest(c.req.raw, {
    acceptsToken: 'session_token'
  });

  const auth = requestState.toAuth();
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('userId', auth.userId);
  await next();
};
