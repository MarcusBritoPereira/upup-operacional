# UP Gestão Operacional

Sistema interno da agência Up&Up para centralizar o acompanhamento de clientes, controle de entregáveis, follow-up semanal, termômetro de saúde, planos de ação e dashboard gerencial.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 16 + TypeScript + Tailwind CSS |
| Backend | NestJS + TypeScript |
| Banco | PostgreSQL 15 |
| ORM | Prisma |
| Auth | JWT + bcrypt |
| Infra Local | Docker Compose |

## Estrutura do projeto

```
upup-operacional/
├── apps/
│   ├── web/        # Frontend Next.js
│   └── api/        # Backend NestJS
├── docs/           # Documentação do produto
├── docker-compose.yml
├── package.json
└── README.md
```

## Pré-requisitos

- Node.js >= 20
- npm >= 10
- Docker Desktop

## Rodando localmente

### 1. Clone o repositório e instale as dependências

```bash
git clone <url-do-repositorio>
cd upup-operacional
npm install
```

### 2. Configure as variáveis de ambiente

**Backend:**
```bash
cp apps/api/.env.example apps/api/.env
# Edite apps/api/.env com suas configurações
```

**Frontend:**
```bash
cp apps/web/.env.local.example apps/web/.env.local
# Edite apps/web/.env.local se necessário
```

### 3. Suba o banco de dados

```bash
npm run db:up
```

Isso inicia um container PostgreSQL local na porta `5436` por padrão.

### 4. Rode as migrações do Prisma

```bash
npm run db:migrate
npm run db:generate
```

### 5. Inicie o backend

```bash
npm run dev:api
```

A API estará disponível em: `http://localhost:3001`

Liveness: `http://localhost:3001/health/live`

Readiness: `http://localhost:3001/health/ready`

### 6. Inicie o frontend

```bash
npm run dev:web
```

O app estará disponível em: `http://localhost:3000`

---

## Verificações de qualidade

```bash
npm run migration:check
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

A pipeline em `.github/workflows/ci.yml` executa essas verificações com PostgreSQL 15 e também valida drift entre as migrations e o schema Prisma.


## Produção

Antes de publicar, copie `.env.production.example` para `.env.production` no ambiente de deploy e preencha todos os segredos com valores fortes. O compose de produção não aceita fallbacks para banco, JWT ou criptografia de credenciais.

```bash
npm run migration:check
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
./scripts/deploy.sh
```

O deploy cria backup do PostgreSQL, executa migrations antes de confirmar os serviços e valida os health checks locais. Consulte `docs/PRODUCTION_RUNBOOK.md` para rollback, backups e verificações pós-deploy.

### Segurança em produção

- `COOKIE_SECURE=true` e `REQUIRE_TRUSTED_ORIGIN=true` devem permanecer ativos.
- `CREDENTIALS_ENCRYPTION_KEY` protege senhas de clientes em repouso e deve ficar em cofre seguro.
- A visualização de senhas de clientes é auditada em `credential_access_logs`.
- Não use valores padrão de banco, JWT ou secrets em VPS/staging/produção.

## Health checks

- `GET /health/live` — processo da API está vivo.
- `GET /health/ready` — API está pronta e o PostgreSQL responde.

## Rotas da API

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/health` | Health check da API |
| `POST` | `/auth/login` | Login com e-mail e senha |

## Rotas do frontend

| Rota | Descrição |
|------|-----------|
| `/login` | Tela de login |
| `/dashboard` | Dashboard gerencial |
| `/today` | Hoje preciso olhar |
| `/clients` | Lista de clientes |
| `/action-plans` | Planos de ação |
| `/followups` | Follow-ups semanais |
| `/teams` | Squads |
| `/settings` | Configurações |

---

## Fases do produto

- **Fase 1 — MVP Operacional** ← _em andamento_
- Fase 2 — Inteligência Operacional
- Fase 3 — Gestão de Pessoas
- Fase 4 — Treinamentos e Onboarding
- Fase 5 — Integrações e IA

---

## Segurança

- **Nunca commite** o arquivo `.env` ou `.env.local`
- Use sempre `.env.example` para compartilhar as variáveis necessárias
- Não use banco de produção para desenvolvimento local
- Faça commit por etapa com mensagens descritivas

---

## Módulos da Etapa 1

- [x] Estrutura do projeto (monorepo)
- [x] Configuração do frontend (Next.js + Tailwind)
- [x] Configuração do backend (NestJS)
- [x] Configuração do Prisma + Schema do banco
- [x] Tela de login
- [x] Layout base do dashboard (responsivo)
- [x] Sidebar no desktop / Bottom nav no mobile
- [x] Rota de health check
- [x] Módulo de Clientes (Etapa 2)
- [x] Contratos e Entregáveis (Etapa 3)
- [x] Follow-up Semanal (Etapa 4)
- [x] Termômetro do Cliente (Etapa 5)
- [x] Dashboard Gerencial completo (Etapa 6)
- [x] Planos de Ação (Etapa 7)
- [x] Hardening inicial para produção

---

## Documentação Detalhada

Para mais detalhes sobre as partes específicas do sistema, consulte:
- [Documentação da API (Backend)](./apps/api/README.md)
- [Documentação do Web (Frontend)](./apps/web/README.md)
- [Documentação para IA (LLMs)](./llms.txt)
