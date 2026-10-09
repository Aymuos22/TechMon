import type { IncomingMessage, ServerResponse } from 'node:http';
import { ensureSchema, getSql } from '../../_lib/db.js';
import { getBaseUrl, readCookie, redirect, sendJson, setCookie } from '../../_lib/http.js';
import { setSessionCookie } from '../../_lib/session.js';

interface GoogleUser {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'method_not_allowed' });
    return;
  }
  const url = new URL(req.url ?? '/', getBaseUrl(req));
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code || !state || state !== readCookie(req, 'techmon_oauth_state')) {
    sendJson(res, 400, { error: 'invalid_oauth_state' });
    return;
  }
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    sendJson(res, 500, { error: 'google_oauth_not_configured' });
    return;
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${getBaseUrl(req)}/api/auth/google/callback`,
    }),
  });
  const tokenData = (await tokenResponse.json()) as { access_token?: string };
  if (!tokenResponse.ok || !tokenData.access_token) {
    sendJson(res, 401, { error: 'oauth_exchange_failed' });
    return;
  }

  const userResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { authorization: `Bearer ${tokenData.access_token}` },
  });
  if (!userResponse.ok) {
    sendJson(res, 401, { error: 'google_profile_failed' });
    return;
  }
  const googleUser = (await userResponse.json()) as GoogleUser;
  const name = googleUser.name ?? googleUser.email ?? 'Google Player';

  await ensureSchema();
  const sql = getSql();
  const rows = await sql<{ id: string; display_name: string; avatar_url: string | null }[]>`
    insert into users (id, oauth_provider, oauth_id, display_name, avatar_url)
    values (${crypto.randomUUID()}, ${'google'}, ${googleUser.sub}, ${name}, ${googleUser.picture ?? null})
    on conflict (oauth_provider, oauth_id)
    do update set
      display_name = excluded.display_name,
      avatar_url = excluded.avatar_url,
      updated_at = now()
    returning id, display_name, avatar_url
  `;
  const savedUser = rows[0];
  await setSessionCookie(res, {
    id: savedUser.id,
    name: savedUser.display_name,
    avatarUrl: savedUser.avatar_url ?? undefined,
  });
  setCookie(res, 'techmon_oauth_state', '', { maxAgeSeconds: 0, httpOnly: true });
  redirect(res, '/');
}
