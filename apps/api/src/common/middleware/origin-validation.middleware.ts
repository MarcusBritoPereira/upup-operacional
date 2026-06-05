import type { NextFunction, Request, RequestHandler, Response } from 'express';

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function createOriginValidationMiddleware(
  allowedOrigins: readonly string[],
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.get('origin');

    if (origin && UNSAFE_METHODS.has(req.method) && !allowedOrigins.includes(origin)) {
      res.status(403).json({ message: 'Origin não permitida.' });
      return;
    }

    next();
  };
}
