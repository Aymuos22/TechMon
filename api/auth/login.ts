import type { IncomingMessage, ServerResponse } from 'node:http';
import { getBaseUrl, redirect, sendJson, setCookie } from '../_lib/http';

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'method_not_allowed' });
    return;
  }
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    sendJson(res, 500, { error: 'github_oauth_not_configured' });
    return;
  }
  const state = crypto.randomUUID();
  setCookie(res, 'techmon_oauth_state', state, { maxAgeSeconds: 600, httpOnly: true });
  const callbackUrl = `${getBaseUrl(req)}/api/auth/callback`;
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', callbackUrl);
  url.searchParams.set('scope', 'read:user user:email');
  url.searchParams.set('state', state);
  redirect(res, url.toString());
}
