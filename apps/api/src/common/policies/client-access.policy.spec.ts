import { ForbiddenException } from '@nestjs/common';
import { ClientAccessPolicy } from './client-access.policy';

function createPolicy(options: {
  managerId?: string | null;
  squadId?: string | null;
  isSquadMember?: boolean;
}) {
  const prisma = {
    client: {
      findUnique: jest.fn().mockResolvedValue({
        managerId: options.managerId ?? null,
        squadId: options.squadId ?? null,
      }),
    },
    squadMember: {
      findFirst: jest
        .fn()
        .mockResolvedValue(options.isSquadMember ? { id: 'membership-id' } : null),
    },
  };

  return {
    policy: new ClientAccessPolicy(prisma as never),
    prisma,
  };
}

describe('ClientAccessPolicy', () => {
  it('allows privileged roles to view any client', async () => {
    const { policy, prisma } = createPolicy({});

    await expect(
      policy.assertCanViewClient('admin-id', 'admin', 'client-id'),
    ).resolves.toBeUndefined();
    expect(prisma.client.findUnique).not.toHaveBeenCalled();
  });

  it('allows the assigned manager to manage the client', async () => {
    const { policy } = createPolicy({ managerId: 'manager-id' });

    await expect(
      policy.assertCanManageClient('manager-id', 'gestor_cliente', 'client-id'),
    ).resolves.toBeUndefined();
  });

  it('allows a squad member to operate but not manage the client', async () => {
    const { policy } = createPolicy({ squadId: 'squad-id', isSquadMember: true });

    await expect(
      policy.assertCanOperateClient('member-id', 'colaborador', 'client-id'),
    ).resolves.toBeUndefined();
    await expect(
      policy.assertCanManageClient('member-id', 'colaborador', 'client-id'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('denies users outside the client portfolio', async () => {
    const { policy } = createPolicy({
      managerId: 'other-manager',
      squadId: 'other-squad',
      isSquadMember: false,
    });

    await expect(
      policy.assertCanViewClient('user-id', 'gestor_cliente', 'client-id'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
