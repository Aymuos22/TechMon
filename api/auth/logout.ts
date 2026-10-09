import type { IncomingMessage, ServerResponse } from 'node:http';
import { clearSessionCookie } from '../_lib/session';
import { methodNotAllowed, sendJson } from '../_lib/http';

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST']);
    return;
  }
  clearSessionCookie(res);
  sendJson(res, 200, { ok: true });
}
