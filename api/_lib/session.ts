import type { IncomingMessage, ServerResponse } from 'node:http';
import { jwtVerify, SignJWT } from 'jose';
import { readCookie, setCookie } from './http';

const SESSION_COOKIE = 'techmon_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export interface SessionUser {
  id: string;
  name: string;
  avatarUrl?: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('AUTH_SECRET must be at least 32 characters');
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ name: user.name, avatarUrl: user.avatarUrl })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret());
}

export async function getSessionUser(req: IncomingMessage): Promise<SessionUser | null> {
  const token = readCookie(req, SESSION_COOKIE);
  if (!token) return null;
  try {
    const result = await jwtVerify(token, getSecret());
    const id = result.payload.sub;
    const name = result.payload.name;
    const avatarUrl = result.payload.avatarUrl;
    if (!id || typeof name !== 'string') return null;
    return {
      id,
      name,
      avatarUrl: typeof avatarUrl === 'string' ? avatarUrl : undefined,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(res: ServerResponse, user: SessionUser): Promise<void> {
  setCookie(res, SESSION_COOKIE, await createSessionToken(user), {
    maxAgeSeconds: SESSION_TTL_SECONDS,
    httpOnly: true,
  });
}

export function clearSessionCookie(res: ServerResponse): void {
  setCookie(res, SESSION_COOKIE, '', { maxAgeSeconds: 0, httpOnly: true });
}
