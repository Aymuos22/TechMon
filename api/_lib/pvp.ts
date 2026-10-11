import type { IncomingMessage, ServerResponse } from 'node:http';
import type { BattleAction } from '../../src/types/battle.js';
import type { PvpBattleRoom, PvpRoomView, PvpSide } from '../../src/types/pvp.js';
import type { OwnedTechnology } from '../../src/types/technology.js';
import { createPvpPlayer, createPvpRoom, joinPvpRoom, submitPvpAction } from '../../src/game/battle/PvpBattleEngine.js';
import { ensureSchema, getSql } from './db.js';
import { getSessionUser } from './session.js';
import { methodNotAllowed, readJsonBody, sendJson } from './http.js';

interface PvpRow {
  code: string;
  host_user_id: string;
  guest_user_id: string | null;
  room_data: PvpBattleRoom;
}

interface PartyPayload {
  name?: string;
  party?: OwnedTechnology[];
}

function generateCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

function cleanCode(value: unknown): string {
  return String(value ?? '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
}

function validateParty(party: unknown): party is OwnedTechnology[] {
  return (
    Array.isArray(party) &&
    party.length > 0 &&
    party.length <= 6 &&
    party.some((tech) => typeof tech === 'object' && tech !== null && (tech as OwnedTechnology).currentHp > 0)
  );
}

function sideFor(row: PvpRow, userId: string): PvpSide | null {
  if (row.host_user_id === userId) return 'host';
  if (row.guest_user_id === userId) return 'guest';
  return null;
}

function roomView(row: PvpRow, userId: string): PvpRoomView | null {
  const side = sideFor(row, userId);
  if (!side) return null;
  return { room: row.room_data, side };
}

function jsonRoom(sql: ReturnType<typeof getSql>, room: PvpBattleRoom): Parameters<typeof sql.json>[0] {
  return JSON.parse(JSON.stringify(room)) as Parameters<typeof sql.json>[0];
}

async function loadRoom(code: string): Promise<PvpRow | null> {
  const sql = getSql();
  const rows = await sql<PvpRow[]>`
    select code, host_user_id, guest_user_id, room_data
    from pvp_battles
    where code = ${code}
  `;
  return rows[0] ?? null;
}

async function updateRoom(row: PvpRow, room: PvpBattleRoom): Promise<void> {
  const sql = getSql();
  await sql`
    update pvp_battles
    set room_data = ${sql.json(jsonRoom(sql, room))}, status = ${room.status}, updated_at = now()
    where code = ${row.code}
  `;
}

export async function handlePvpCreate(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  await ensureSchema();
  const user = await getSessionUser(req);
  if (!user) return sendJson(res, 401, { error: 'auth_required' });

  const body = await readJsonBody<PartyPayload>(req);
  if (!validateParty(body?.party)) return sendJson(res, 400, { error: 'battle_ready_party_required' });

  const sql = getSql();
  for (let attempts = 0; attempts < 5; attempts++) {
    const code = generateCode();
    const host = createPvpPlayer(user.id, body?.name || user.name || 'Host', body.party);
    const room = createPvpRoom(code, host);
    try {
      await sql`
        insert into pvp_battles (code, host_user_id, room_data, status)
        values (${code}, ${user.id}, ${sql.json(jsonRoom(sql, room))}, ${room.status})
      `;
      return sendJson(res, 200, { room, side: 'host' satisfies PvpSide });
    } catch {
      // Retry rare code collision.
    }
  }

  return sendJson(res, 500, { error: 'could_not_create_room' });
}

export async function handlePvpJoin(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  await ensureSchema();
  const user = await getSessionUser(req);
  if (!user) return sendJson(res, 401, { error: 'auth_required' });

  const body = await readJsonBody<PartyPayload & { code?: string }>(req);
  const code = cleanCode(body?.code);
  if (!code) return sendJson(res, 400, { error: 'battle_id_required' });
  if (!validateParty(body?.party)) return sendJson(res, 400, { error: 'battle_ready_party_required' });

  const row = await loadRoom(code);
  if (!row) return sendJson(res, 404, { error: 'room_not_found' });
  if (row.host_user_id === user.id) {
    const view = roomView(row, user.id);
    return sendJson(res, 200, view);
  }
  if (row.guest_user_id && row.guest_user_id !== user.id) {
    return sendJson(res, 409, { error: 'room_full' });
  }

  const guest = createPvpPlayer(user.id, body?.name || user.name || 'Guest', body.party);
  const room = row.guest_user_id === user.id ? row.room_data : joinPvpRoom(row.room_data, guest);
  const sql = getSql();
  await sql`
    update pvp_battles
    set guest_user_id = ${user.id}, room_data = ${sql.json(jsonRoom(sql, room))}, status = ${room.status}, updated_at = now()
    where code = ${code}
      and (guest_user_id is null or guest_user_id = ${user.id})
  `;
  return sendJson(res, 200, { room, side: 'guest' satisfies PvpSide });
}

export async function handlePvpRoom(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  await ensureSchema();
  const user = await getSessionUser(req);
  if (!user) return sendJson(res, 401, { error: 'auth_required' });

  const url = new URL(req.url ?? '', 'http://local');
  const code = cleanCode(url.searchParams.get('code'));
  if (!code) return sendJson(res, 400, { error: 'battle_id_required' });

  const row = await loadRoom(code);
  if (!row) return sendJson(res, 404, { error: 'room_not_found' });
  const view = roomView(row, user.id);
  if (!view) return sendJson(res, 403, { error: 'not_in_room' });
  return sendJson(res, 200, view);
}

export async function handlePvpAction(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  await ensureSchema();
  const user = await getSessionUser(req);
  if (!user) return sendJson(res, 401, { error: 'auth_required' });

  const body = await readJsonBody<{ code?: string; action?: BattleAction }>(req);
  const code = cleanCode(body?.code);
  if (!code || !body?.action) return sendJson(res, 400, { error: 'invalid_action_payload' });

  const row = await loadRoom(code);
  if (!row) return sendJson(res, 404, { error: 'room_not_found' });
  const side = sideFor(row, user.id);
  if (!side) return sendJson(res, 403, { error: 'not_in_room' });

  const room = submitPvpAction(row.room_data, side, body.action);
  await updateRoom(row, room);
  return sendJson(res, 200, { room, side });
}

export async function handlePvpLeave(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  await ensureSchema();
  const user = await getSessionUser(req);
  if (!user) return sendJson(res, 401, { error: 'auth_required' });

  const body = await readJsonBody<{ code?: string }>(req);
  const code = cleanCode(body?.code);
  if (!code) return sendJson(res, 400, { error: 'battle_id_required' });

  const row = await loadRoom(code);
  if (!row) return sendJson(res, 404, { error: 'room_not_found' });
  const side = sideFor(row, user.id);
  if (!side) return sendJson(res, 403, { error: 'not_in_room' });
  const winner: PvpSide = side === 'host' ? 'guest' : 'host';
  const room: PvpBattleRoom = {
    ...row.room_data,
    status: 'finished',
    winner,
    log: [...row.room_data.log, { id: `pvp_leave_${Date.now()}`, text: `${row.room_data[side]?.name ?? 'Player'} left the room.` }],
  };
  await updateRoom(row, room);
  return sendJson(res, 200, { room, side });
}
