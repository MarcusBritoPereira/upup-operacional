import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { requestIp, sanitize } from './audit.utils';

type AuthRequest = Request & {
  user?: {
    id: string;
    email: string;
    role: string;
    sessionId?: string;
  };
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const req = context.switchToHttp().getRequest<AuthRequest>();
    const res = context.switchToHttp().getResponse<Response>();
    const started = Date.now();

    return next.handle().pipe(
      tap({
        next: () => this.save(req, res, started),
        error: () => this.save(req, res, started),
      }),
    );
  }

  private save(
    req: AuthRequest,
    res: Response,
    started: number,
  ): void {
    const method = req.method.toUpperCase();
    const path = (req.originalUrl || req.url).split('?')[0];

    if (
      !req.user ||
      !['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) ||
      path.startsWith('/auth/') ||
      path.startsWith('/health')
    ) {
      return;
    }

    const parts = path.split('/').filter(Boolean);
    const entityType: string | null = parts[0] ?? null;

    const paramId = req.params?.id;
    const entityId: string | null =
      typeof paramId === 'string' ? paramId : null;

    const verb =
      method === 'POST'
        ? 'CREATED'
        : method === 'DELETE'
          ? 'DELETED'
          : 'UPDATED';

    const action =
      `${(entityType ?? 'RESOURCE')
        .replace(/-/g, '_')
        .toUpperCase()}_${verb}`;

    const metadata = sanitize({
      params: req.params,
      query: req.query,
      body: req.body,
    }) as Prisma.InputJsonValue;

    void this.prisma.activityAuditLog
      .create({
        data: {
          userId: req.user.id,
          action,
          entityType,
          entityId,
          description: `${method} ${path}`,
          method,
          path,
          statusCode: res.statusCode,
          durationMs: Date.now() - started,
          ipAddress: requestIp(req),
          userAgent: req.headers['user-agent'] ?? null,
          metadata,
        },
      })
      .catch((error: unknown) => {
        console.error('Falha ao registrar auditoria:', error);
      });
  }
}
