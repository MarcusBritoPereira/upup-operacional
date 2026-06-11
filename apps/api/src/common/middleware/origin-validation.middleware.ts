import type { NextFunction, Request, RequestHandler, Response } from 'express';

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function getOriginFromReferer(referer: string | undefined): string | undefined {
  if (!referer) return undefined;
  try {
    const url = new URL(referer);
    return url.origin;
  } catch {
    return undefined;
  }
}

export function createOriginValidationMiddleware(
  allowedOrigins: readonly string[],
  requireTrustedOrigin = false,
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!UNSAFE_METHODS.has(req.method)) {
      next();
      return;
    }

    const origin = req.get('origin') ?? getOriginFromReferer(req.get('referer'));

    if (!origin && requireTrustedOrigin) {
      res.status(403).json({ message: 'Origem obrigatória para mutações.' });
      return;
    }

    if (origin && !allowedOrigins.includes(origin)) {
      res.status(403).json({ message: 'Origin não permitida.' });
      return;
    }

    next();
  };
}
