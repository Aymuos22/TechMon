import type { IncomingMessage, ServerResponse } from 'node:http';
import { handlePvpAction } from '../_lib/pvp.js';

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    await handlePvpAction(req, res);
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'pvp_action_failed' }));
  }
}
