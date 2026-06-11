import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function run() {
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash('123456', saltRounds);

  const gees = [
    { name: 'Ludimila', email: 'ludimila@upup.com.br' },
    { name: 'David', email: 'david@upup.com.br' },
    { name: 'Kidney', email: 'kidney@upup.com.br' }
  ];

  for (const gee of gees) {
    const existing = await prisma.user.findUnique({
      where: { email: gee.email }
    });

    if (!existing) {
      await prisma.user.create({
        data: {
          name: gee.name,
          email: gee.email,
          passwordHash: passwordHash,
          role: 'gestor_cliente',
          department: 'GEE',
          position: 'GEE',
          isActive: true
        }
      });
      console.log(`Created GEE: ${gee.name}`);
    } else {
      console.log(`GEE already exists: ${gee.name}`);
    }
  }
}

run()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
