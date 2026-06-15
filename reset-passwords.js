const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const defaultPassword = 'Upup@123';
  const hash = await bcrypt.hash(defaultPassword, 10);
  
  const result = await prisma.user.updateMany({
    data: {
      passwordHash: hash
    }
  });
  
  console.log(`Senha padrão "${defaultPassword}" gerada para ${result.count} usuários na tabela User.`);
  
  const users = await prisma.user.findMany({ select: { name: true, email: true, role: true } });
  console.log('Lista de usuários atualizados:');
  console.table(users);
}

main().catch(console.error).finally(() => prisma.$disconnect());
