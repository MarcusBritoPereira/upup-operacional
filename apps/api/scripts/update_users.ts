import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const usersData = [
  { name: 'Marco Vaz', email: 'marcovaz.artes@gmail.com' },
  { name: 'David TG', email: 'davidtiagoguedes@gmail.com' },
  { name: 'Yan Lucas', email: 'yanbalieiro7@gmail.com' },
  { name: 'Lorena', email: 'hey.lorenapereira@gmail.com' },
  { name: 'Kidney Seixas', email: 'kidneyseixas@gmail.com' },
  { name: 'Davisson Messias', email: 'davissonrocha82@gmail.com' },
  { name: 'Allaf Brito', email: 'allaf991806795@gmail.com' },
  { name: 'Naldo', email: 'lucaslucinaldo19@gmail.com' },
  { name: 'Walber Valente', email: 'walberedrian2002@gmail.com' },
  { name: 'Paulo Oliveira Fernandes', email: 'fernandespaulo330@gmail.com' },
  { name: 'Gustavo', email: 'gustavoxstm@gmail.com' },
  { name: 'Aira Laís', email: 'airalcastro@gmail.com' },
  { name: 'Up&Up Marketing Digital', email: 'upeupmarketing@gmail.com' }
];

async function main() {
  const defaultPassword = 'Upup2026!';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  for (const userData of usersData) {
    const existingUser = await prisma.user.findUnique({ where: { email: userData.email } });
    
    if (existingUser) {
      await prisma.user.update({
        where: { email: userData.email },
        data: {
          passwordHash,
          name: userData.name,
        }
      });
      console.log(`[USER] Updated: ${userData.email}`);
    } else {
      // Create user if not exists
      await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          passwordHash,
          role: 'colaborador',
          isActive: true
        }
      });
      console.log(`[USER] Created: ${userData.email}`);
    }
    
    // Also try to find ServiceProvider by name or email
    const sp = await prisma.serviceProvider.findFirst({
      where: {
        OR: [
          { name: { contains: userData.name, mode: 'insensitive' } },
          { email: userData.email }
        ]
      }
    });
    
    if (sp && sp.email !== userData.email) {
      await prisma.serviceProvider.update({
        where: { id: sp.id },
        data: { email: userData.email }
      });
      console.log(`[SERVICE_PROVIDER] Updated email for: ${sp.name} -> ${userData.email}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
