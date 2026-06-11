import { ActionPlansController } from './action-plans/action-plans.controller';
import { AlertsController } from './alerts/alerts.controller';
import { FollowupsController } from './followups/followups.controller';
import { MonthlyCyclesController } from './monthly-cycles/monthly-cycles.controller';

const user = { id: 'user-id', role: 'gestor_cliente' };
const request = { user };

describe('client-scoped controllers', () => {
  it('checks client operation access before creating a follow-up', async () => {
    const service = { create: jest.fn() };
    const policy = {
      assertCanOperateClient: jest.fn().mockResolvedValue(undefined),
    };
    const controller = new FollowupsController(
      service as never,
      policy as never,
    );
    const dto = {
      clientId: 'client-id',
      monthlyCycleId: 'cycle-id',
      weekStart: '2026-06-01',
      weekEnd: '2026-06-07',
    };

    await controller.create(request, dto);

    expect(policy.assertCanOperateClient).toHaveBeenCalledWith(
      user.id,
      user.role,
      dto.clientId,
    );
    expect(service.create).toHaveBeenCalledWith(user.id, dto);
  });

  it('checks the deliverable client before updating it', async () => {
    const service = {
      getClientIdForDeliverable: jest.fn().mockResolvedValue('client-id'),
      updateDeliverable: jest.fn(),
    };
    const policy = {
      assertCanOperateClient: jest.fn().mockResolvedValue(undefined),
    };
    const controller = new MonthlyCyclesController(
      service as never,
      policy as never,
    );

    await controller.updateDeliverable(
      'deliverable-id',
      { deliveredQuantity: 1 },
      request,
    );

    expect(policy.assertCanOperateClient).toHaveBeenCalledWith(
      user.id,
      user.role,
      'client-id',
    );
  });

  it('checks the alert client before resolving it', async () => {
    const service = {
      findOne: jest
        .fn()
        .mockResolvedValue({ id: 'alert-id', clientId: 'client-id' }),
      resolve: jest.fn(),
    };
    const policy = {
      assertCanOperateClient: jest.fn().mockResolvedValue(undefined),
    };
    const controller = new AlertsController(service as never, policy as never);

    await controller.resolve('alert-id', request);

    expect(policy.assertCanOperateClient).toHaveBeenCalledWith(
      user.id,
      user.role,
      'client-id',
    );
    expect(service.resolve).toHaveBeenCalledWith('alert-id', user.id);
  });

  it('checks the plan client before returning a plan', async () => {
    const service = {
      findOne: jest
        .fn()
        .mockResolvedValue({ id: 'plan-id', clientId: 'client-id' }),
    };
    const policy = {
      assertCanViewClient: jest.fn().mockResolvedValue(undefined),
    };
    const controller = new ActionPlansController(
      service as never,
      policy as never,
    );

    await controller.findOne('plan-id', request);

    expect(policy.assertCanViewClient).toHaveBeenCalledWith(
      user.id,
      user.role,
      'client-id',
    );
  });
});
