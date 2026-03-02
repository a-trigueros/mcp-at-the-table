import type { Request } from "express";

export function getSessionId(req: Request): string | null {
  const sessionId = req.headers["mcp-session-id"];

  if (Array.isArray(sessionId)) {
    return sessionId[0] ?? null;
  }

  return sessionId ?? null;
}


export function isInitializeRequest(req: Request): boolean {
  return req?.body?.method === 'initialize';
}

export function getLastEventId(req: Request): string | null {

  const lastEventId = req.headers['last-event-id'];

  if (Array.isArray(lastEventId)) {
    return lastEventId[0] ?? null;
  }

  return lastEventId ?? null;
}
