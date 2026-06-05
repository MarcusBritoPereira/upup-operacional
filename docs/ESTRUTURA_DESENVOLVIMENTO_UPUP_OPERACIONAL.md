# ESTRUTURA DE DESENVOLVIMENTO — UP&UP OPERACIONAL

## 1. Objetivo técnico

Criar um sistema web responsivo, com experiência boa em desktop e mobile, para a gestão operacional da agência Up&Up.

A primeira versão deve ser uma aplicação web responsiva/PWA, evitando o custo e a complexidade de criar um app nativo no início.

## 2. Stack recomendada

### Frontend
- Next.js
- TypeScript
- TailwindCSS
- Shadcn/UI
- React Hook Form
- Zod
- TanStack Query
- Recharts para gráficos simples

### Backend
- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT
- Bcrypt
- RBAC para controle de permissões

### Infraestrutura
- Docker para ambiente local
- VPS, Render, Railway ou Fly.io para deploy
- PostgreSQL gerenciado ou containerizado
- Backup diário do banco
- Logs de erro

## 3. Por que começar com web responsivo/PWA

A rotina da liderança pede desktop para análise completa, filtros, tabelas e dashboards.

A rotina dos gestores pede mobile para ações rápidas, como preencher follow-up, visualizar alertas e atualizar planos de ação.

Por isso, a melhor decisão inicial é criar uma aplicação web responsiva. Depois, se o uso validar necessidade, pode virar app com React Native/Expo.

## 4. Estrutura de projeto sugerida

```txt
upup-operacional/
  apps/
    web/
    api/
  packages/
    shared/
  docker-compose.yml
  README.md
```

## 5. Estrutura do frontend

```txt
apps/web/
  src/
    app/
      (auth)/
        login/
      (dashboard)/
        dashboard/
        today/
        clients/
          page.tsx
          [id]/
            page.tsx
            followups/
            deliverables/
            action-plans/
        action-plans/
        teams/
        settings/
    components/
      ui/
      layout/
        sidebar.tsx
        mobile-nav.tsx
        header.tsx
      dashboard/
        overview-cards.tsx
        today-list.tsx
        risk-clients.tsx
      clients/
        client-card.tsx
        client-table.tsx
        client-form.tsx
        client-health-badge.tsx
      followups/
        weekly-followup-form.tsx
      action-plans/
        action-plan-form.tsx
        action-plan-card.tsx
      responsive/
        desktop-only.tsx
        mobile-only.tsx
    hooks/
    lib/
      api.ts
      auth.ts
      permissions.ts
    schemas/
    services/
    types/
    utils/
```

## 6. Estrutura do backend

```txt
apps/api/
  src/
    modules/
      auth/
        auth.controller.ts
        auth.service.ts
        jwt.strategy.ts
      users/
      squads/
      clients/
      contracts/
      deliverables/
      monthly-cycles/
      followups/
      health/
      action-plans/
      alerts/
      dashboard/
      timeline/
    common/
      guards/
        jwt-auth.guard.ts
        roles.guard.ts
      decorators/
        roles.decorator.ts
        current-user.decorator.ts
      filters/
      pipes/
    prisma/
      prisma.service.ts
    main.ts
```

## 7. Fluxo principal do sistema

1. Admin cadastra usuários.
2. Admin cadastra squads.
3. Admin cadastra clientes.
4. Admin define gestor e squad de cada cliente.
5. Admin cadastra contrato e entregáveis contratados.
6. Sistema cria ciclo mensal do cliente.
7. Gestor preenche follow-up semanal.
8. Sistema calcula termômetro.
9. Cliente em risco aparece no dashboard.
10. Liderança cria plano de ação.
11. Plano é acompanhado até conclusão.
12. Histórico fica salvo na timeline do cliente.

## 8. Experiência desktop

O desktop deve ser a visão de gestão completa.

### Layout desktop
- Sidebar fixa à esquerda.
- Header superior com busca e filtros rápidos.
- Cards de resumo no topo.
- Tabelas completas.
- Filtros por gestor, squad, status, mês e risco.

### Telas desktop prioritárias
- Dashboard geral.
- Hoje preciso olhar.
- Clientes.
- Detalhe do cliente.
- Entregáveis.
- Follow-ups.
- Planos de ação.
- Squads.

## 9. Experiência mobile

O mobile deve ser a visão de ação rápida.

### Layout mobile
- Menu inferior com 4 abas.
- Cards empilhados.
- Botões grandes.
- Formulários curtos.
- Tabelas transformadas em cards.

### Abas mobile sugeridas
1. Início
2. Clientes
3. Alertas
4. Planos

### Telas mobile prioritárias
- Meus clientes.
- Preencher follow-up.
- Ver cliente em risco.
- Atualizar plano de ação.
- Ver alertas.

## 10. Componentes essenciais

### ClientHealthBadge
Mostra o status do cliente:
- Verde
- Amarelo
- Vermelho
- Cinza

### ClientCardMobile
Card com dados essenciais:
- Nome do cliente
- Gestor
- Status do termômetro
- Último follow-up
- Próxima ação

### TodayNeedAttentionList
Lista de prioridades do dia:
- Clientes vermelhos
- Clientes sem follow-up
- Planos vencidos
- Entregas atrasadas

### WeeklyFollowupForm
Formulário rápido com perguntas objetivas e nota de 1 a 5.

### ActionPlanCard
Resumo do plano:
- Cliente
- Problema
- Responsável
- Prazo
- Status

## 11. Design responsivo

### Breakpoints
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

### Regras
- Tabelas viram cards no mobile.
- Sidebar vira bottom navigation no mobile.
- Filtros avançados ficam em drawer no mobile.
- Botões principais ficam fixos no rodapé quando necessário.
- Formulários longos devem ser divididos em blocos.

## 12. Banco de dados

Usar PostgreSQL.

Tabelas principais:
- users
- squads
- squad_members
- clients
- contracts
- deliverable_types
- monthly_cycles
- monthly_deliverables
- weekly_followups
- client_health_snapshots
- action_plans
- alerts
- client_timeline
- churn_reasons

## 13. API principal

### Auth
- POST /auth/login
- POST /auth/forgot-password
- POST /auth/reset-password

### Dashboard
- GET /dashboard/overview
- GET /dashboard/today
- GET /dashboard/managers
- GET /dashboard/churn

### Clientes
- GET /clients
- POST /clients
- GET /clients/:id
- PATCH /clients/:id
- GET /clients/:id/timeline
- GET /clients/:id/health

### Follow-up
- GET /followups
- POST /followups
- GET /clients/:id/followups
- PATCH /followups/:id

### Planos de ação
- GET /action-plans
- POST /action-plans
- PATCH /action-plans/:id

### Alertas
- GET /alerts
- PATCH /alerts/:id/resolve

## 14. Sprints sugeridas

### Sprint 1 — Base do sistema
- Login
- Usuários
- Permissões
- Squads
- Clientes

### Sprint 2 — Contratos e entregáveis
- Contratos
- Tipos de entregáveis
- Ciclos mensais
- Entregáveis mensais

### Sprint 3 — Follow-up e termômetro
- Formulário semanal
- Cálculo do termômetro
- Alertas básicos

### Sprint 4 — Dashboard e planos de ação
- Dashboard geral
- Hoje preciso olhar
- Planos de ação
- Timeline do cliente

### Sprint 5 — Responsividade e refinamento
- Ajustes mobile
- Melhorias de UX
- Correções
- Testes com usuários reais

## 15. Critérios técnicos de qualidade

- O sistema deve carregar rápido no mobile.
- O dashboard deve abrir em menos de 3 segundos.
- O follow-up deve ser preenchido em menos de 2 minutos.
- O gestor não deve precisar clicar em muitas telas para atualizar um cliente.
- A liderança deve conseguir identificar clientes em risco logo na primeira tela.
- Dados importantes não devem ser apagados, apenas arquivados.
- Todo alerta deve ter status: aberto ou resolvido.
- Todo cliente vermelho deve exigir plano de ação.

## 16. Recomendações finais para desenvolvimento

Começar simples.

Não criar app nativo agora.

Não integrar ClickUp no MVP.

Não criar CRM no MVP.

Não colocar Roda da GEE no MVP.

Validar primeiro se os gestores realmente preenchem o follow-up toda semana.

Se o follow-up for preenchido com consistência, o sistema terá dados suficientes para gerar inteligência real.
