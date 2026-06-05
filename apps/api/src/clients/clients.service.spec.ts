import { ClientsService } from './clients.service';

describe('ClientsService', () => {
  const createdClient = {
    id: '7d3a4228-e501-48d9-a8b4-fbfef37fba20',
    entryDate: new Date('2026-06-05'),
    exitDate: null,
  };
  const transactionClient = {
    client: { create: jest.fn() },
    contract: { create: jest.fn() },
  };
  const prisma = {
    $transaction: jest.fn(),
    client: { update: jest.fn() },
  };
  let service: ClientsService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(
      async (callback: (tx: typeof transactionClient) => Promise<unknown>) =>
        callback(transactionClient),
    );
    transactionClient.client.create.mockResolvedValue(createdClient);
    service = new ClientsService(prisma as any);
  });

  it('creates the initial contract atomically from the frontend monthly value', async () => {
    await service.create({
      tradeName: 'Cliente exemplo',
      entryDate: '2026-06-05',
      monthlyContractValue: 5000,
    });

    expect(transactionClient.client.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ monthlyContractValue: 5000 }),
      }),
    );
    expect(transactionClient.contract.create).toHaveBeenCalledWith({
      data: {
        clientId: createdClient.id,
        startDate: new Date('2026-06-05'),
        monthlyValue: 5000,
        status: 'active',
        notes: 'Contrato inicial cadastrado com o cliente.',
      },
    });
  });

  it('does not create an initial contract when the monthly value is zero', async () => {
    await service.create({
      tradeName: 'Cliente sem contrato',
      entryDate: '2026-06-05',
      monthlyContractValue: 0,
    });

    expect(transactionClient.contract.create).not.toHaveBeenCalled();
  });

  it('ignores the aggregate value sent by the legacy edit form', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue(createdClient as any);
    prisma.client.update.mockResolvedValue(createdClient);

    await service.update(createdClient.id, { monthlyContractValue: 9000 });

    expect(prisma.client.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {},
      }),
    );
  });
});
