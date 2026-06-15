import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando Simulação do Escopo Operacional...\n');

  // 1. Setup Deliverable Types
  console.log('1️⃣ Configurando Tipos de Entregáveis...');
  const types = ['Conteúdos p/ Redes Sociais', 'Gravação Externa', 'Gravação no Estúdio'];
  const deliverableTypes = [];
  
  for (const name of types) {
    const type = await prisma.deliverableType.upsert({
      where: { name },
      update: {},
      create: { name, description: `Entregável: ${name}` },
    });
    deliverableTypes.push(type);
  }
  console.log(`✅ Tipos configurados: ${deliverableTypes.map(d => d.name).join(', ')}\n`);

  // 2. Cycle Creation & Initialization
  console.log('2️⃣ Buscando um cliente para teste...');
  const client = await prisma.client.findFirst();
  
  if (!client) {
    console.log('❌ Nenhum cliente encontrado no banco de dados. Crie um cliente primeiro.');
    return;
  }
  
  console.log(`✅ Cliente selecionado: ${client.tradeName} (ID: ${client.id})\n`);
  
  console.log('3️⃣ Criando o Ciclo Mensal (Junho/2026)...');
  const cycle = await prisma.monthlyCycle.upsert({
    where: {
      clientId_month_year: {
        clientId: client.id,
        month: 6,
        year: 2026
      }
    },
    update: {},
    create: {
      clientId: client.id,
      month: 6,
      year: 2026,
      status: 'open',
      healthStatus: 'green'
    }
  });
  console.log(`✅ Ciclo ID: ${cycle.id} criado com sucesso.\n`);

  console.log('4️⃣ Inicializando Escopo Operacional (CONTRATADO)...');
  // Simulando que o contrato prevê: 15 conteúdos, 2 externas, 1 estúdio
  const contractedQuantities = [15, 2, 1];
  
  for (let i = 0; i < deliverableTypes.length; i++) {
    await prisma.monthlyDeliverable.upsert({
      where: {
        monthlyCycleId_deliverableTypeId: {
          monthlyCycleId: cycle.id,
          deliverableTypeId: deliverableTypes[i].id
        }
      },
      update: {
        contractedQuantity: contractedQuantities[i],
        deliveredQuantity: 0,
        inProgressQuantity: 0,
        delayedQuantity: 0,
        status: 'pending'
      },
      create: {
        monthlyCycleId: cycle.id,
        deliverableTypeId: deliverableTypes[i].id,
        contractedQuantity: contractedQuantities[i],
        status: 'pending'
      }
    });
  }
  console.log('✅ Itens contratados foram vinculados ao ciclo.\n');

  // 3. Feeding Data (Simulando o dia a dia)
  console.log('5️⃣ Atualizando os dados (Simulando a alimentação manual ao longo da semana)...');
  
  // Atualiza Conteúdos (Entregou 5, 3 em progresso, 1 atrasado)
  await prisma.monthlyDeliverable.update({
    where: {
      monthlyCycleId_deliverableTypeId: {
        monthlyCycleId: cycle.id,
        deliverableTypeId: deliverableTypes[0].id // Conteúdos
      }
    },
    data: {
      deliveredQuantity: 5,
      inProgressQuantity: 3,
      delayedQuantity: 1,
      status: 'in_progress',
      notes: 'O post de quarta está atrasado aguardando aprovação.'
    }
  });

  // Atualiza Gravação Externa (1 já foi feita, 1 ainda pendente)
  await prisma.monthlyDeliverable.update({
    where: {
      monthlyCycleId_deliverableTypeId: {
        monthlyCycleId: cycle.id,
        deliverableTypeId: deliverableTypes[1].id // Externa
      }
    },
    data: {
      deliveredQuantity: 1,
      status: 'in_progress'
    }
  });

  // Atualiza Estúdio (Nenhuma feita ainda)
  // Permanece do jeito que foi criado
  
  console.log('✅ Rotina de preenchimento simulada com sucesso!\n');

  // 4. Monitoring (Mostrando como fica a tabela)
  console.log('📊 TABELA FINAL: ESCOPO OPERACIONAL DE JUNHO/2026 📊');
  
  const finalDeliverables = await prisma.monthlyDeliverable.findMany({
    where: { monthlyCycleId: cycle.id },
    include: { deliverableType: true }
  });

  const tableData = finalDeliverables.map(d => ({
    'Tipo de Entregável': d.deliverableType.name,
    'Contratado': d.contractedQuantity,
    'Concluído': d.deliveredQuantity,
    'Em Progresso': d.inProgressQuantity,
    'Atrasado': d.delayedQuantity,
    'Status': d.status,
    'Observações': d.notes || '-'
  }));

  console.table(tableData);
  console.log('\n✅ Simulação finalizada.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
