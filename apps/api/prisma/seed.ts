import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean old data
  await prisma.squadMember.deleteMany({});
  await prisma.squad.deleteMany({});
  await prisma.user.deleteMany({});

  const saltRounds = 10;
  const adminPasswordHash = await bcrypt.hash('admin123', saltRounds);
  const managerPasswordHash = await bcrypt.hash('gestor123', saltRounds);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'Admin UpUp',
      email: 'admin@upup.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      department: 'Diretoria',
      position: 'Diretor de Operações',
      isActive: true,
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: 'Gestor UpUp',
      email: 'gestor@upup.com',
      passwordHash: managerPasswordHash,
      role: 'gestor_cliente',
      department: 'Atendimento',
      position: 'Gestor de Contas',
      isActive: true,
    },
  });

  console.log('Users created:', { admin: admin.email, manager: manager.email });

  // 2. Create Squads
  const squadAlpha = await prisma.squad.create({
    data: {
      name: 'Squad Alpha',
      leaderId: manager.id,
      status: 'active',
    },
  });

  const squadBeta = await prisma.squad.create({
    data: {
      name: 'Squad Beta',
      leaderId: admin.id,
      status: 'active',
    },
  });

  console.log('Squads created:', [squadAlpha.name, squadBeta.name]);

  // 3. Create memberships
  await prisma.squadMember.create({
    data: {
      squadId: squadAlpha.id,
      userId: manager.id,
    },
  });

  await prisma.squadMember.create({
    data: {
      squadId: squadBeta.id,
      userId: admin.id,
    },
  });

  console.log('Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
