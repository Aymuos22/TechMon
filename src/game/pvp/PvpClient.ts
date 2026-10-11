import type { BattleAction } from '../../types/battle';
import type { PvpRoomView } from '../../types/pvp';
import type { OwnedTechnology } from '../../types/technology';

async function parseJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function postPvp<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await parseJson<T & { error?: string }>(response);
  if (!response.ok || !data) {
    throw new Error(data?.error ?? 'pvp_request_failed');
  }
  return data;
}

export function createPvpRoom(name: string, party: OwnedTechnology[]): Promise<PvpRoomView> {
  return postPvp('/api/pvp/create', { name, party });
}

export function joinPvpRoom(code: string, name: string, party: OwnedTechnology[]): Promise<PvpRoomView> {
  return postPvp('/api/pvp/join', { code, name, party });
}

export async function loadPvpRoom(code: string): Promise<PvpRoomView> {
  const response = await fetch(`/api/pvp/room?code=${encodeURIComponent(code)}`, {
    credentials: 'include',
  });
  const data = await parseJson<PvpRoomView & { error?: string }>(response);
  if (!response.ok || !data) {
    throw new Error(data?.error ?? 'pvp_room_failed');
  }
  return data;
}

export function submitPvpAction(code: string, action: BattleAction): Promise<PvpRoomView> {
  return postPvp('/api/pvp/action', { code, action });
}

export function leavePvpRoom(code: string): Promise<PvpRoomView> {
  return postPvp('/api/pvp/leave', { code });
}
