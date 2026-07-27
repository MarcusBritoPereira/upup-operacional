import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const oldEmail = 'david@upup.com.br';
  const newEmail = 'davidtiagoguedes@gmail.com';

  const oldUser = await prisma.user.findUnique({ where: { email: oldEmail } });
  const newUser = await prisma.user.findUnique({ where: { email: newEmail } });

  if (!oldUser || !newUser) {
    console.error('Um dos usuários não foi encontrado.');
    return;
  }

  // Transaction for safety
  await prisma.$transaction(async (tx) => {
    // 1. Update Client manager
    await tx.client.updateMany({
      where: { managerId: oldUser.id },
      data: { managerId: newUser.id }
    });

    // 2. Update MonthlyCycle manager
    await tx.monthlyCycle.updateMany({
      where: { managerId: oldUser.id },
      data: { managerId: newUser.id }
    });

    // 3. Update WeeklyFollowup manager
    await tx.weeklyFollowup.updateMany({
      where: { managerId: oldUser.id },
      data: { managerId: newUser.id }
    });

    // 4. Update ActionPlan responsible & creator
    await tx.actionPlan.updateMany({
      where: { responsibleId: oldUser.id },
      data: { responsibleId: newUser.id }
    });
    await tx.actionPlan.updateMany({
      where: { createdById: oldUser.id },
      data: { createdById: newUser.id }
    });

    // 5. Update ClientTimeline creator
    await tx.clientTimeline.updateMany({
      where: { createdById: oldUser.id },
      data: { createdById: newUser.id }
    });

    // 6. Update Alert resolver
    await tx.alert.updateMany({
      where: { resolvedById: oldUser.id },
      data: { resolvedById: newUser.id }
    });

    // 7. Update CredentialAccessLog user
    await tx.credentialAccessLog.updateMany({
      where: { userId: oldUser.id },
      data: { userId: newUser.id }
    });

    // 8. Handle ClientTeamMember (could have duplicates, so upsert or just ignore if already there)
    const oldMembers = await tx.clientTeamMember.findMany({ where: { userId: oldUser.id } });
    for (const om of oldMembers) {
      const exists = await tx.clientTeamMember.findUnique({
        where: {
          clientId_userId_role: {
            clientId: om.clientId,
            userId: newUser.id,
            role: om.role
          }
        }
      });
      if (exists) {
        await tx.clientTeamMember.delete({ where: { id: om.id } });
      } else {
        await tx.clientTeamMember.update({
          where: { id: om.id },
          data: { userId: newUser.id }
        });
      }
    }

    // 9. Ensure the new user has the 'gestor_cliente' role
    await tx.user.update({
      where: { id: newUser.id },
      data: { role: 'gestor_cliente' }
    });

    // 10. Finally, delete the old user
    await tx.user.delete({
      where: { id: oldUser.id }
    });
  });

  console.log(`[SUCCESS] Migrated all data from ${oldEmail} to ${newEmail} and deleted the old account.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
