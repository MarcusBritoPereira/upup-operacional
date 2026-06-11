import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';

function createController(queryResult: Promise<unknown>) {
  const prisma = { $queryRaw: jest.fn().mockReturnValue(queryResult) };
  return {
    controller: new HealthController(prisma as never),
    prisma,
  };
}

describe('HealthController', () => {
  it('reports liveness without accessing the database', () => {
    const { controller, prisma } = createController(
      Promise.resolve([{ '?column?': 1 }]),
    );

    expect(controller.liveness()).toMatchObject({
      status: 'ok',
      check: 'live',
    });
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });

  it('reports readiness when the database responds', async () => {
    const { controller } = createController(
      Promise.resolve([{ '?column?': 1 }]),
    );

    await expect(controller.readiness()).resolves.toMatchObject({
      status: 'ok',
      check: 'ready',
    });
  });

  it('returns service unavailable when the database is down', async () => {
    const { controller } = createController(
      Promise.reject(new Error('offline')),
    );

    await expect(controller.readiness()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
