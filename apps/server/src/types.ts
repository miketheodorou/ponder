import type { ClerkHonoVariables } from '@clerk/hono';

export type AuthedEnv = {
  Variables: ClerkHonoVariables & {
    userId: string;
  };
};
