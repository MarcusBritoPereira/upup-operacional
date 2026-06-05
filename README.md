# UP Gestão Operacional

Sistema interno da agência Up&Up para centralizar o acompanhamento de clientes, controle de entregáveis, follow-up semanal, termômetro de saúde, planos de ação e dashboard gerencial.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 15 + TypeScript + Tailwind CSS |
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

Isso inicia um container PostgreSQL local na porta `5432`.

### 4. Rode as migrações do Prisma

```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma generate
cd ../..
```

### 5. Inicie o backend

```bash
npm run dev:api
```

A API estará disponível em: `http://localhost:3001`

Health check: `http://localhost:3001/health`

### 6. Inicie o frontend

```bash
npm run dev:web
```

O app estará disponível em: `http://localhost:3000`

---

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
- [ ] Módulo de Clientes (Etapa 2)
- [ ] Contratos e Entregáveis (Etapa 3)
- [ ] Follow-up Semanal (Etapa 4)
- [ ] Termômetro do Cliente (Etapa 5)
- [ ] Dashboard Gerencial completo (Etapa 6)
- [ ] Planos de Ação (Etapa 7)
