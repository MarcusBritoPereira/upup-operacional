import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Find all 'GEE' assignments in the team member table
  const geeMembers = await prisma.clientTeamMember.findMany({
    where: { role: 'GEE' },
    include: { client: true, user: true }
  });

  let count = 0;
  for (const gee of geeMembers) {
    // If the client doesn't already have a manager, or we want to override it:
    await prisma.client.update({
      where: { id: gee.clientId },
      data: { managerId: gee.userId }
    });
    
    console.log(`Assigned manager ${gee.user.name} to client ${gee.client.tradeName}`);
    
    // Remove the redundant GEE role
    await prisma.clientTeamMember.delete({
      where: { id: gee.id }
    });
    
    count++;
  }
  
  console.log(`Updated ${count} clients.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
