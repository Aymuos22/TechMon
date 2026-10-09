import type { IncomingMessage, ServerResponse } from 'node:http';
import { methodNotAllowed, sendJson } from '../_lib/http';
import { getSessionUser } from '../_lib/session';

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'GET') {
    methodNotAllowed(res, ['GET']);
    return;
  }
  const user = await getSessionUser(req);
  sendJson(res, 200, { user });
}
