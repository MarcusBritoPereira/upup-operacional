# CHANGELOG — UP&UP OPERACIONAL

Todas as mudanças importantes deste projeto serão documentadas aqui.

Formato baseado em Keep a Changelog.

---

## [2.0.0] — 2026-06-05

### Alterado
- Reestruturação completa do plano do sistema com foco em MVP realista.
- Separação clara entre Fase 1, Fase 2, Fase 3, Fase 4 e Fase 5.
- Remoção da ideia de construir um “super app” logo na primeira versão.
- Priorização do sistema como painel de controle operacional da liderança.
- Ajuste do escopo para não substituir ClickUp, CRM, Google Drive, WhatsApp ou ferramentas de relatório na primeira etapa.

### Adicionado
- Definição de posicionamento interno do sistema.
- Criação da lógica “Hoje preciso olhar”.
- Estrutura de termômetro do cliente com pontuação de 0 a 100.
- Regras para classificação em verde, amarelo, vermelho e cinza.
- Regras de alerta para clientes sem follow-up, clientes em risco e entregas atrasadas.
- Controle de entregáveis contratados x entregues.
- Alerta de excesso de escopo quando a entrega ultrapassar 120% do contratado.
- Estrutura de ciclo mensal por cliente.
- Histórico/timeline do cliente.
- Critérios de aceite do MVP.
- Estrutura recomendada para frontend e backend.
- Diretrizes para responsividade web/mobile.
- Sugestão de stack técnica com Next.js, NestJS, PostgreSQL e Prisma.
- Endpoints principais da API.

### Mantido para fases futuras
- Roda da GEE.
- PDI.
- Avaliação interna.
- Avaliação entre pares.
- Biblioteca de treinamentos.
- Onboarding de novos colaboradores.
- Integração com ClickUp.
- Integração com WhatsApp.
- Integração com Google Drive.
- Integração com Meta Ads.
- Assistente de IA.

### Decisão estratégica
- A primeira versão deve resolver apenas a gestão operacional dos clientes.
- Gestão de pessoas e treinamentos entram somente após validação do fluxo operacional.

---

## [1.0.0] — 2026-06-05

### Adicionado
- Primeira versão do documento base do sistema.
- Ideia inicial de centralização de clientes, contratos, entregáveis, termômetro, planos de ação, Roda da GEE e playbooks.
- Cadastro de clientes ativos e inativos.
- Registro de data de entrada e saída para cálculo de churn e tempo de vida do cliente.
- Cadastro de valor de contrato.
- Relação entre cliente, gestor e squad.
- Ideia de questionário de acompanhamento semanal.
- Ideia de alertas para clientes com risco.
- Ideia de planos de ação para problemas recorrentes.
- Ideia de gestão de pessoas com autoavaliação e avaliação da liderança.

---

## Próximos passos sugeridos

### Sprint 1
- Criar autenticação.
- Criar estrutura de usuários e permissões.
- Criar cadastro de clientes.
- Criar cadastro de squads.

### Sprint 2
- Criar contratos.
- Criar tipos de entregáveis.
- Criar ciclos mensais.
- Criar controle de entregáveis mensais.

### Sprint 3
- Criar formulário de follow-up semanal.
- Criar cálculo inicial do termômetro.
- Criar alertas básicos.

### Sprint 4
- Criar dashboard gerencial.
- Criar tela “Hoje preciso olhar”.
- Criar planos de ação.

### Sprint 5
- Melhorar responsividade mobile.
- Ajustar UX com base no uso real.
- Corrigir bugs.
- Preparar primeira versão estável.
