import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting merge for Kidney...');

  const gestorId = '5e81ba22-efb5-46ed-b551-23c37b67af20'; // kidney@upup.com.br (gestor_cliente)
  const colaboradorId = '0e0845f3-1259-48e6-997f-bce12f162d30'; // kidneyseixas@gmail.com (colaborador)

  // Move everything from colaborador to gestor (if there's anything)
  
  // ClientTeamMember
  await prisma.clientTeamMember.updateMany({
    where: { userId: colaboradorId },
    data: { userId: gestorId }
  });

  // CredentialAccessLog
  await prisma.credentialAccessLog.updateMany({
    where: { userId: colaboradorId },
    data: { userId: gestorId }
  });

  // ActionPlan (responsible)
  await prisma.actionPlan.updateMany({
    where: { responsibleId: colaboradorId },
    data: { responsibleId: gestorId }
  });

  // ActionPlan (creator)
  await prisma.actionPlan.updateMany({
    where: { createdById: colaboradorId },
    data: { createdById: gestorId }
  });

  // Alert (resolvedBy)
  await prisma.alert.updateMany({
    where: { resolvedById: colaboradorId },
    data: { resolvedById: gestorId }
  });

  // ClientTimeline (creator)
  await prisma.clientTimeline.updateMany({
    where: { createdById: colaboradorId },
    data: { createdById: gestorId }
  });

  // WeeklyFollowup (manager)
  await prisma.weeklyFollowup.updateMany({
    where: { managerId: colaboradorId },
    data: { managerId: gestorId }
  });

  // Delete the colaborador account
  await prisma.user.delete({
    where: { id: colaboradorId }
  });

  // Update the gestor account to have the correct email and name
  await prisma.user.update({
    where: { id: gestorId },
    data: {
      email: 'kidneyseixas@gmail.com',
      name: 'Kidney Seixas'
    }
  });

  console.log('Successfully merged Kidney accounts!');
}

main()
  .catch((e) => {
    console.error('Error merging accounts:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
