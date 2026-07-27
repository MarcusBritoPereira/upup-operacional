import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const defaultPassword = 'upup';

const emailsToUpdate = [
  { namePart: 'Marco', email: 'marcovaz.artes@gmail.com' },
  { namePart: 'David TG', email: 'davidtiagoguedes@gmail.com' },
  { namePart: 'Yan', email: 'yanbalieiro7@gmail.com' },
  { namePart: 'Lorena', email: 'hey.lorenapereira@gmail.com' },
  { namePart: 'Kidney', email: 'kidneyseixas@gmail.com' },
  { namePart: 'Davisson', email: 'davissonrocha82@gmail.com' },
  { namePart: 'Allaf', email: 'allaf991806795@gmail.com' },
  { namePart: 'Naldo', email: 'lucaslucinaldo19@gmail.com' },
  { namePart: 'Walber', email: 'walberedrian2002@gmail.com' },
  { namePart: 'Paulo', email: 'fernandespaulo330@gmail.com' },
  { namePart: 'Gustavo', email: 'gustavoxstm@gmail.com' },
  { namePart: 'Aira', email: 'airalcastro@gmail.com' },
  { namePart: 'Up', email: 'upeupmarketing@gmail.com' },
];

async function main() {
  console.log('Starting user fixes...');

  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  // 1. Remove david@upup.com.br
  const oldDavid = await prisma.user.findUnique({ where: { email: 'david@upup.com.br' } });
  if (oldDavid) {
    console.log('Removing old David:', oldDavid.email);
    await prisma.user.delete({ where: { id: oldDavid.id } });
  }

  const allUsers = await prisma.user.findMany();
  
  // 2. Update emails and passwords
  for (const update of emailsToUpdate) {
    const user = allUsers.find(u => u.name.toLowerCase().includes(update.namePart.toLowerCase()));
    if (user) {
      console.log(`Updating ${user.name} to email ${update.email}`);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          email: update.email,
          passwordHash: passwordHash
        }
      });
    } else {
      console.log(`User matching ${update.namePart} not found.`);
    }
  }
  
  // Update password for any other remaining user just in case
  const remainingUsers = await prisma.user.findMany();
  for (const u of remainingUsers) {
    await prisma.user.update({
      where: { id: u.id },
      data: { passwordHash }
    });
  }
  console.log('All passwords reset to "upup"');

  // 3. Fix Redundancy in ClientTeamMember roles: Gestor vs GEE
  // GEE is Gestor de Estratégia e Execução. Gestor is the same.
  // We'll rename all 'GEE' roles to 'Gestor (Estratégia e Execução)'.
  // Also rename 'Gestor' to 'Gestor (Estratégia e Execução)'.
  
  const teamMembers = await prisma.clientTeamMember.findMany();
  for (const tm of teamMembers) {
    if (tm.role.toLowerCase() === 'gee' || tm.role.toLowerCase() === 'gestor' || tm.role.toLowerCase() === 'gestor (estratégia)') {
      console.log(`Updating role ${tm.role} -> Gestor (Estratégia e Execução)`);
      // Since it's a unique constraint on [clientId, userId, role], we must be careful with duplicates.
      try {
        await prisma.clientTeamMember.update({
          where: { id: tm.id },
          data: { role: 'Gestor (Estratégia e Execução)' }
        });
      } catch (e) {
        console.log(`Could not update, possibly a duplicate exists. Deleting redundant ${tm.role}`);
        await prisma.clientTeamMember.delete({ where: { id: tm.id } });
      }
    }
  }

  console.log('Done fixing users and roles.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
