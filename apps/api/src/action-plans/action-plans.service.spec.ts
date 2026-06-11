import { BadRequestException } from '@nestjs/common';
import { ActionPlansService } from './action-plans.service';

function createService(cycleClientId: string) {
  const tx = {
    client: {
      findUnique: jest.fn().mockResolvedValue({ id: 'client-a' }),
    },
    monthlyCycle: {
      findUnique: jest.fn().mockResolvedValue({ clientId: cycleClientId }),
    },
    actionPlan: {
      create: jest.fn(),
    },
    clientTimeline: {
      create: jest.fn(),
    },
  };
  const prisma = {
    $transaction: jest.fn((callback: (client: typeof tx) => unknown) =>
      callback(tx),
    ),
  };

  return {
    service: new ActionPlansService(prisma as never),
    tx,
  };
}

describe('ActionPlansService', () => {
  it('rejects a monthly cycle belonging to another client', async () => {
    const { service, tx } = createService('client-b');

    await expect(
      service.create('creator-id', {
        clientId: 'client-a',
        monthlyCycleId: 'cycle-b',
        problem: 'Problema',
        action: 'Ação',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.actionPlan.create).not.toHaveBeenCalled();
  });
});
