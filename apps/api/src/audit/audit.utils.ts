import type { Request } from 'express';

const blocked = new Set([
  'password','passwordHash','password_hash','currentPassword','newPassword',
  'token','access_token','authorization','cookie','secret','apiKey','api_key'
]);

export function requestIp(req: Request): string | null {
  const xff = req.headers['x-forwarded-for'];
  const ip = (Array.isArray(xff) ? xff[0] : xff?.split(',')[0]?.trim())
    || req.ip || req.socket.remoteAddress || null;
  return ip?.replace(/^::ffff:/, '') ?? null;
}

export function sanitize(value: unknown, depth = 0): unknown {
  if (depth > 5) return '[MAX_DEPTH]';
  if (value === null || value === undefined || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.slice(0, 100).map(v => sanitize(v, depth + 1));

  const result: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    result[key] = blocked.has(key) ? '[REDACTED]' : sanitize(child, depth + 1);
  }
  return result;
}
