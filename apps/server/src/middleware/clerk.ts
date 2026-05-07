import { getAuth } from '@clerk/hono';
import type { MiddlewareHandler } from 'hono';

export const requireAuth: MiddlewareHandler = async (c, next) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  c.set('userId', auth.userId);
  await next();
};
