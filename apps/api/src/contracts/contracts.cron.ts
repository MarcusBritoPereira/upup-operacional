import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { AlertsService } from '../alerts/alerts.service';
import { AlertSeverity } from '@prisma/client';

@Injectable()
export class ContractsCronService {
  private readonly logger = new Logger(ContractsCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly alertsService: AlertsService,
  ) {}

  // Roda todos os dias às 02:00 da manhã
  @Cron('0 2 * * *')
  async checkExpiringContracts() {
    this.logger.log('Iniciando verificação de contratos próximos do vencimento...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + 30);
    thresholdDate.setHours(23, 59, 59, 999);

    try {
      const expiringContracts = await this.prisma.contract.findMany({
        where: {
          status: 'active',
          endDate: {
            not: null,
            lte: thresholdDate,
            gte: today, // evita recriar infinitamente para contratos vencidos antigos
          },
        },
        include: { client: true },
      });

      let alertsCreated = 0;

      for (const contract of expiringContracts) {
        const existingAlert = await this.prisma.alert.findFirst({
          where: {
            clientId: contract.clientId,
            alertType: 'contract_expiration',
            status: 'open',
          },
        });

        if (!existingAlert) {
          const expirationDateStr = contract.endDate!.toLocaleDateString('pt-BR');
          await this.alertsService.createAlert(
            contract.clientId,
            'contract_expiration',
            AlertSeverity.medium,
            `Contrato próximo do vencimento (${expirationDateStr})`,
            `O contrato do cliente ${contract.client.tradeName} vence no dia ${expirationDateStr}. Por favor, revise as condições para renovação.`,
          );
          alertsCreated++;
          this.logger.log(`Alerta de vencimento criado para o cliente ${contract.client.tradeName}`);
        }
      }

      this.logger.log(`Verificação concluída. ${alertsCreated} alerta(s) gerado(s).`);
    } catch (error) {
      this.logger.error('Erro ao verificar vencimento de contratos', error);
    }
  }
}
