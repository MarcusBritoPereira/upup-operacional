import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  live() {
    return this.buildResponse('live');
  }

  @Get('live')
  liveness() {
    return this.buildResponse('live');
  }

  @Get('ready')
  async readiness() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return this.buildResponse('ready');
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        check: 'ready',
        service: 'upup-operacional-api',
        database: 'unavailable',
      });
    }
  }

  private buildResponse(check: 'live' | 'ready') {
    return {
      status: 'ok',
      check,
      service: 'upup-operacional-api',
      timestamp: new Date().toISOString(),
    };
  }
}
