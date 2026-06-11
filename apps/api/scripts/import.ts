import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const data = [
  { "name": "Allaf Brito", "email": "allaf991806795@gmail.com", "whatsapp": "+55 93 98404-1202", "role": "Filmmaker", "linkedClients": ["Distribuidora Durães","Way Jeep Ram","Dr Luiz Manuel","Hamburgueria Muiraquitã","Essencial Informática","Hering","Magiofer","Clinical Empire","Instituto Arantes","Centro de Terapias PH","COS Santarém","Bill Car","New Móveis","Vulp","João Gomes ADV"] },
  { "name": "Gustavo Sousa", "email": "gustavoxstm@gmail.com", "whatsapp": "+55 93 99123-2792", "role": "Filmmaker", "linkedClients": ["Via Marconi","Tapajós Skate Shop","Dr. Diego Reale","Instituto Bruno Moura","Murylo Corretor","Clinica Monteiro Kishi","Machado Lima","Dra. Serlen Monteiro","Dr. Renato Auzier","Igor Maximinano","Agencia Up&Up","Dra. Ana Luiza","Prudentte Lima Imóveis","Prudentte Lima Incorporadora"] },
  { "name": "Davisson Messias", "email": "davissonrocha82@gmail.com", "whatsapp": "+55 93 98405-7229", "role": "Filmmaker", "linkedClients": ["Maximus Hamburgueria e Churrascaria","Macedo Engenharia","Sanclin","Veneta Açaí","Maria do Carmo","Cartão Eco","CRD","Predileta","Nunes Barbearia","Recanto do Amanhã","Hotel Oliver","Lancha Gold Star"] },
  { "name": "Allaf Brito", "email": "allaf991806795@gmail.com", "whatsapp": "+55 93 98404-1202", "role": "Editor", "linkedClients": ["COS Santarém","Bill Car"] },
  { "name": "Gustavo Sousa", "email": "gustavoxstm@gmail.com", "whatsapp": "+55 93 99123-2792", "role": "Editor", "linkedClients": ["Dr. Diego Reale","Machado Lima"] },
  { "name": "Davisson Messias", "email": "davissonrocha82@gmail.com", "whatsapp": "+55 93 98405-7229", "role": "Editor", "linkedClients": ["Veneta Açaí","Recanto do Amanhã"] },
  { "name": "Naldo", "email": "lucaslucinaldo19@gmail.com", "whatsapp": "+55 93 99117-9137", "role": "Editor", "linkedClients": ["Macedo Engenharia","Sanclin","Via Marconi","Distribuidora Durães","Essencial Informática","Murylo Corretor","Nunes Barbearia","Instituto Arantes","Dr. Renato Auzier","Igor Maximinano","New Móveis","Hotel Oliver","Dra. Ana Luiza","João Gomes ADV","Prudentte Lima Imóveis","Prudentte Lima Incorporadora"] },
  { "name": "Paulo Oliveira Fernandes", "email": "fernandespaulo330@gmail.com", "whatsapp": "+55 93 99117-6534", "role": "Editor", "linkedClients": [] },
  { "name": "Walber Valente", "email": "walberedrian2002@gmail.com", "whatsapp": "+55 93 98418-6762", "role": "Editor", "linkedClients": ["Tapajós Skate Shop","Way Jeep Ram","Dr Luiz Manuel","Hamburgueria Muiraquitã","Cartão Eco","Instituto Bruno Moura","Hering","Magiofer","CRD","Clinica Monteiro Kishi","Clinical Empire","Dra. Serlen Monteiro","Centro de Terapias PH","Agencia Up&Up","Vulp","Lancha Gold Star"] },
  { "name": "Yan Lucas", "email": "yanbalieiro7@gmail.com", "whatsapp": "+55 92 98271-2085", "role": "Editor", "linkedClients": ["Maximus Hamburgueria e Churrascaria","Maria do Carmo","Predileta"] },
  { "name": "Aira Laís", "email": "airalcastro@gmail.com", "whatsapp": "+55 93 99112-2544", "role": "Designer", "linkedClients": ["Maria do Carmo"] },
  { "name": "Lorena", "email": "hey.lorenapereira@gmail.com", "whatsapp": "+55 93 98408-6850", "role": "Designer", "linkedClients": ["Tapajós Skate Shop","Dr. Diego Reale","Hamburgueria Muiraquitã","Murylo Corretor","Clinica Monteiro Kishi","Machado Lima","Predileta","Dra. Serlen Monteiro","Instituto Arantes","Dr. Renato Auzier","Centro de Terapias PH","COS Santarém","Igor Maximinano","Bill Car","New Móveis","Agencia Up&Up","Vulp","Hotel Oliver","Dra. Ana Luiza"] },
  { "name": "Marco Vaz", "email": "marcovaz.artes@gmail.com", "whatsapp": "+55 93 99130-3084", "role": "Designer", "linkedClients": ["Maximus Hamburgueria e Churrascaria","Macedo Engenharia","Distribuidora Durães","Veneta Açaí","Dr Luiz Manuel","Instituto Bruno Moura","Essencial Informática","Hering","Magiofer","CRD","Clinical Empire","Nunes Barbearia","Recanto do Amanhã","João Gomes ADV","Prudentte Lima Imóveis","Prudentte Lima Incorporadora","Lancha Gold Star"] }
];

async function run() {
  console.log('Starting import...');
  // Clear existing links to start fresh
  console.log('Clearing existing client service provider links...');
  await prisma.clientServiceProvider.deleteMany();

  const clients = await prisma.client.findMany();
  
  for (const item of data) {
    // Check if provider exists
    let provider = await prisma.serviceProvider.findUnique({
      where: { email: item.email }
    });

    if (!provider) {
      provider = await prisma.serviceProvider.create({
        data: {
          name: item.name,
          email: item.email,
          whatsapp: item.whatsapp,
          role: item.role,
        }
      });
      console.log(`Created provider ${item.name} (${item.role})`);
    } else {
      console.log(`Provider ${item.name} already exists. Skipping creation.`);
    }

    // Link clients
    for (const clientName of item.linkedClients) {
      const client = clients.find(c => 
        c.tradeName.toLowerCase() === clientName.toLowerCase() || 
        c.tradeName.toLowerCase().includes(clientName.toLowerCase())
      );

      if (client) {
        // Try linking
        try {
          const existingLink = await prisma.clientServiceProvider.findUnique({
            where: {
              clientId_serviceProviderId_role: {
                clientId: client.id,
                serviceProviderId: provider.id,
                role: item.role
              }
            }
          });

          if (!existingLink) {
            await prisma.clientServiceProvider.create({
              data: {
                clientId: client.id,
                serviceProviderId: provider.id,
                role: item.role
              }
            });
            console.log(`Linked ${item.name} -> ${client.tradeName} as ${item.role}`);
          }
        } catch (error) {
          console.error(`Error linking ${item.name} to ${clientName}:`, error.message);
        }
      } else {
        console.warn(`Client not found: ${clientName}`);
      }
    }
  }

  console.log('Import finished!');
}

run()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
