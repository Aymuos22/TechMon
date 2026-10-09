import type { IncomingMessage, ServerResponse } from 'node:http';
import { getBaseUrl, redirect, sendJson, setCookie } from '../_lib/http';

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'method_not_allowed' });
    return;
  }
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    sendJson(res, 500, { error: 'google_oauth_not_configured' });
    return;
  }
  const state = crypto.randomUUID();
  setCookie(res, 'techmon_oauth_state', state, { maxAgeSeconds: 600, httpOnly: true });
  const callbackUrl = `${getBaseUrl(req)}/api/auth/google/callback`;
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', callbackUrl);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('state', state);
  url.searchParams.set('prompt', 'select_account');
  redirect(res, url.toString());
}
