import ky from 'ky';
import { API_URL } from '@/lib/api';

// Clerk's getToken() only lives inside a React hook, but our ky client is a
// module-level singleton. The app root registers Clerk's getter here so the
// beforeRequest hook can read it without crossing the hook boundary.
let getAuthToken: () => Promise<string | null> = async () => null;

export function registerAuthTokenGetter(
  getter: () => Promise<string | null>
) {
  getAuthToken = getter;
}

export const apiClient = ky.create({
  baseUrl: API_URL,
  hooks: {
    beforeRequest: [
      async ({ request }) => {
        const token = await getAuthToken();
        if (token) request.headers.set('Authorization', `Bearer ${token}`);
      }
    ]
  }
});
