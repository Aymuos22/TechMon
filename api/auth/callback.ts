import type { IncomingMessage, ServerResponse } from 'node:http';
import { ensureSchema, getSql } from '../_lib/db';
import { getBaseUrl, readCookie, redirect, sendJson, setCookie } from '../_lib/http';
import { setSessionCookie } from '../_lib/session';

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string | null;
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
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    sendJson(res, 500, { error: 'github_oauth_not_configured' });
    return;
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${getBaseUrl(req)}/api/auth/callback`,
    }),
  });
  const tokenData = (await tokenResponse.json()) as { access_token?: string };
  if (!tokenData.access_token) {
    sendJson(res, 401, { error: 'oauth_exchange_failed' });
    return;
  }

  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      authorization: `Bearer ${tokenData.access_token}`,
      accept: 'application/vnd.github+json',
      'user-agent': 'techmon-code-frontier',
    },
  });
  if (!userResponse.ok) {
    sendJson(res, 401, { error: 'github_profile_failed' });
    return;
  }
  const githubUser = (await userResponse.json()) as GitHubUser;
  const user = {
    id: crypto.randomUUID(),
    provider: 'github',
    oauthId: String(githubUser.id),
    name: githubUser.name ?? githubUser.login,
    avatarUrl: githubUser.avatar_url ?? undefined,
  };

  await ensureSchema();
  const sql = getSql();
  const rows = await sql<{ id: string; display_name: string; avatar_url: string | null }[]>`
    insert into users (id, oauth_provider, oauth_id, display_name, avatar_url)
    values (${user.id}, ${user.provider}, ${user.oauthId}, ${user.name}, ${user.avatarUrl ?? null})
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
