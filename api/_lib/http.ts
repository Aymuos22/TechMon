import type { IncomingMessage, ServerResponse } from 'node:http';

export interface JsonRequest extends IncomingMessage {
  body?: unknown;
}

export function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

export function redirect(res: ServerResponse, location: string): void {
  res.statusCode = 302;
  res.setHeader('location', location);
  res.end();
}

export function methodNotAllowed(res: ServerResponse, methods: string[]): void {
  res.setHeader('allow', methods.join(', '));
  sendJson(res, 405, { error: 'method_not_allowed' });
}

export function getBaseUrl(req: IncomingMessage): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  const host = req.headers['x-forwarded-host'] ?? req.headers.host;
  const proto = req.headers['x-forwarded-proto'] ?? 'http';
  const value = Array.isArray(host) ? host[0] : host;
  return `${proto}://${value}`;
}

export function readCookie(req: IncomingMessage, name: string): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  const cookies = header.split(';').map((part) => part.trim());
  for (const cookie of cookies) {
    const idx = cookie.indexOf('=');
    if (idx === -1) continue;
    const key = cookie.slice(0, idx);
    if (key === name) return decodeURIComponent(cookie.slice(idx + 1));
  }
  return null;
}

export function setCookie(
  res: ServerResponse,
  name: string,
  value: string,
  opts: { maxAgeSeconds?: number; httpOnly?: boolean } = {},
): void {
  const parts = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'SameSite=Lax'];
  if (opts.httpOnly ?? true) parts.push('HttpOnly');
  if (opts.maxAgeSeconds !== undefined) parts.push(`Max-Age=${opts.maxAgeSeconds}`);
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  const next = parts.join('; ');
  const existing = res.getHeader('set-cookie');
  if (!existing) {
    res.setHeader('set-cookie', next);
  } else if (Array.isArray(existing)) {
    res.setHeader('set-cookie', [...existing.map(String), next]);
  } else {
    res.setHeader('set-cookie', [String(existing), next]);
  }
}

export async function readJsonBody<T>(req: IncomingMessage): Promise<T | null> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length === 0) return null;
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as T;
  } catch {
    return null;
  }
}
