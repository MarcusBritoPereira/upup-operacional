# Up&Up Operacional - API (Backend)

Este é o backend do sistema **Up&Up Operacional**, construído com [NestJS](https://nestjs.com/) e [Prisma](https://www.prisma.io/).

## Tecnologias Principais

- **Framework:** NestJS
- **Linguagem:** TypeScript
- **Banco de Dados:** PostgreSQL 15
- **ORM:** Prisma
- **Autenticação:** JWT (JSON Web Tokens) + bcrypt

## Estrutura de Módulos

A API é estruturada em módulos focados em domínios de negócio:

- `auth`: Autenticação e login de usuários.
- `users`: Gestão de usuários do sistema.
- `clients`: Gestão de clientes da agência.
- `alerts`: Geração e acompanhamento de alertas operacionais.
- `followups`: Registro e acompanhamento de follow-ups semanais.
- `dashboard`: Agregação de dados para visão gerencial.

## Pré-requisitos

Para rodar este backend localmente você precisa de:

- Node.js (>= 20)
- Docker & Docker Compose (para rodar o banco de dados)

## Configuração de Ambiente

Crie um arquivo `.env` na raiz do diretório `apps/api` baseado no arquivo de exemplo:

```bash
cp .env.example .env
```

Garanta que as variáveis essenciais estão preenchidas:
- `DATABASE_URL`: String de conexão com o PostgreSQL.
- `JWT_SECRET`: Chave secreta para assinatura dos tokens.
- `PORT`: Porta na qual a API irá rodar (padrão: 3001).

## Rodando a Aplicação

### 1. Iniciar Banco de Dados
A partir da raiz do monorepo, inicie o container PostgreSQL:
```bash
npm run db:up
```

### 2. Rodar Migrations e Gerar Prisma Client
```bash
npm run db:migrate
npm run db:generate
```

### 3. Iniciar o Servidor NestJS
Em modo de desenvolvimento (assiste as mudanças nos arquivos):
```bash
npm run start:dev
```
A API estará disponível em `http://localhost:3001`.

## Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/health/live` | Health Check (Liveness) |
| `GET` | `/health/ready` | Health Check (Readiness, checa o DB) |
| `POST` | `/auth/login` | Realizar login e obter JWT |

*(Para uma lista completa de rotas, verifique os Controllers de cada módulo em `src/`)*

## Testes

```bash
# Testes unitários
npm run test

# Testes End-to-End (e2e)
npm run test:e2e
```
