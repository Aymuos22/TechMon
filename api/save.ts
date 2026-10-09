import type { IncomingMessage, ServerResponse } from 'node:http';
import { ensureSchema, getSql } from './_lib/db.js';
import { methodNotAllowed, readJsonBody, sendJson } from './_lib/http.js';
import { getSessionUser } from './_lib/session.js';

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const user = await getSessionUser(req);
  if (!user) {
    sendJson(res, 401, { error: 'not_authenticated' });
    return;
  }

  await ensureSchema();
  const sql = getSql();

  if (req.method === 'GET') {
    const rows = await sql<{ save_data: unknown; updated_at: Date }[]>`
      select save_data, updated_at from game_saves where user_id = ${user.id}
    `;
    if (!rows[0]) {
      sendJson(res, 200, { save: null });
      return;
    }
    sendJson(res, 200, {
      save: rows[0].save_data,
      updatedAt: rows[0].updated_at.toISOString(),
    });
    return;
  }

  if (req.method === 'PUT') {
    const body = await readJsonBody<{ save?: unknown }>(req);
    if (!body || !body.save || typeof body.save !== 'object') {
      sendJson(res, 400, { error: 'invalid_save_payload' });
      return;
    }
    const saveData = JSON.parse(JSON.stringify(body.save)) as Parameters<typeof sql.json>[0];
    await sql`
      insert into game_saves (user_id, save_data, updated_at)
      values (${user.id}, ${sql.json(saveData)}, now())
      on conflict (user_id)
      do update set save_data = excluded.save_data, updated_at = now()
    `;
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === 'DELETE') {
    await sql`delete from game_saves where user_id = ${user.id}`;
    sendJson(res, 200, { ok: true });
    return;
  }

  methodNotAllowed(res, ['GET', 'PUT', 'DELETE']);
}
