import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      _count: {
        select: {
          clients: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  console.log('--- USUÁRIOS NO BANCO DE DADOS ---');
  console.table(users.map(u => ({
    ID: u.id,
    Nome: u.name,
    Email: u.email,
    Role: u.role,
    Clientes: u._count.clients
  })));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
