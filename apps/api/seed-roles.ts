import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('12345678', 10);
  
  const roles = [
    { email: 'admin@upup.com', name: 'Admin Master', role: UserRole.admin },
    { email: 'diretoria@upup.com', name: 'Diretor Silva', role: UserRole.diretoria },
    { email: 'gerencia@upup.com', name: 'Gerente Carlos', role: UserRole.gerencia },
    { email: 'gestor@upup.com', name: 'Gestor Ana', role: UserRole.gestor_cliente },
    { email: 'colaborador@upup.com', name: 'Colaborador João', role: UserRole.colaborador },
  ];

  console.log('Criando usuários...');

  for (const r of roles) {
    const user = await prisma.user.upsert({
      where: { email: r.email },
      update: {
        role: r.role,
        passwordHash: passwordHash,
      },
      create: {
        email: r.email,
        name: r.name,
        passwordHash: passwordHash,
        role: r.role,
      },
    });
    console.log(`✅ ${user.role} criado: ${user.email}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
