const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { name: true, email: true, role: true }
  });
  console.log("=== LISTA DE USUARIOS ===");
  users.filter(u => u.email).forEach(u => console.log(`${u.name || 'Sem nome'} | ${u.email} | ${u.role}`));
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
