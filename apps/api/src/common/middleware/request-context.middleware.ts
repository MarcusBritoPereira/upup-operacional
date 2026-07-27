import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { randomUUID } from 'crypto';

export function createRequestContextMiddleware(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestId = req.get('x-request-id') ?? randomUUID();
    const startedAt = Date.now();

    res.setHeader('x-request-id', requestId);

    res.on('finish', () => {
      const durationMs = Date.now() - startedAt;
      console.log(
        JSON.stringify({
          level: res.statusCode >= 500 ? 'error' : 'info',
          requestId,
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          durationMs,
        }),
      );
    });

    next();
  };
}
