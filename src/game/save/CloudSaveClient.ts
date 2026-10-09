import type { SaveGame } from '../../types/save';
import { normalizeSave, validateSave } from './SaveManager';

export interface CloudUser {
  id: string;
  name: string;
  avatarUrl?: string;
}

async function parseJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getCloudUser(): Promise<CloudUser | null> {
  const response = await fetch('/api/auth/me', { credentials: 'include' });
  if (!response.ok) return null;
  const data = await parseJson<{ user: CloudUser | null }>(response);
  return data?.user ?? null;
}

export function signInWithGitHub(): void {
  window.location.href = '/api/auth/login';
}

export async function signOutCloud(): Promise<void> {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
}

export async function loadCloudSave(): Promise<SaveGame | null> {
  const response = await fetch('/api/save', { credentials: 'include' });
  if (response.status === 401 || !response.ok) return null;
  const data = await parseJson<{ save: unknown }>(response);
  if (!validateSave(data?.save)) return null;
  return normalizeSave(data.save);
}

export async function saveCloudGame(save: SaveGame): Promise<boolean> {
  const response = await fetch('/api/save', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ save }),
  });
  return response.ok;
}

export async function deleteCloudSave(): Promise<boolean> {
  const response = await fetch('/api/save', {
    method: 'DELETE',
    credentials: 'include',
  });
  return response.ok || response.status === 401;
}
