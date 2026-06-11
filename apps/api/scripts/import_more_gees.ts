import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function run() {
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash('123456', saltRounds);

  const gees = [
    { name: 'Jéssica', email: 'jessica@upup.com.br' },
    { name: 'Julia', email: 'julia@upup.com.br' },
    { name: 'Rosiane', email: 'rosiane@upup.com.br' },
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
          passwordHash,
          role: 'gestor_cliente', // Cargo de GEE no DB
          isActive: true,
        }
      });
      console.log(`Created GEE: ${gee.name}`);
    } else {
      console.log(`GEE already exists: ${gee.name}`);
    }
  }

  console.log('Finished creating GEEs.');
}

run()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
