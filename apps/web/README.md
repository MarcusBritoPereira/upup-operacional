# Up&Up Operacional - Web (Frontend)

Este é o frontend do sistema **Up&Up Operacional**, construído com [Next.js](https://nextjs.org/) (App Router), [React](https://react.dev/) e [Tailwind CSS](https://tailwindcss.com/).

## Tecnologias Principais

- **Framework:** Next.js 16+ (App Router)
- **Biblioteca UI:** React 19
- **Estilização:** Tailwind CSS
- **Linguagem:** TypeScript

## Estrutura do Diretório

A aplicação segue a estrutura padrão do App Router do Next.js:

- `app/`: Contém as páginas (`page.tsx`), layouts (`layout.tsx`) e definições de rotas da aplicação.
- `components/`: Componentes React reutilizáveis que compõem a UI.
- `lib/`: Utilitários, funções auxiliares e configurações.
- `public/`: Arquivos estáticos (imagens, ícones, fontes).

## Rotas Principais

- `/login` - Tela de autenticação
- `/dashboard` - Visão gerencial e indicadores globais
- `/clients` - Gestão de clientes
- `/action-plans` - Planos de ação
- `/followups` - Follow-ups semanais das squads
- `/today` - Visão diária de atenção ("Hoje preciso olhar")

## Configuração de Ambiente

Crie um arquivo `.env.local` na raiz do diretório `apps/web` usando o arquivo de exemplo como base:

```bash
cp .env.local.example .env.local
```

Certifique-se de configurar a URL da API para que o frontend consiga se comunicar com o backend local:
- `NEXT_PUBLIC_API_URL=http://localhost:3001` (padrão local)

## Rodando a Aplicação

A partir da raiz do monorepo, inicie o servidor de desenvolvimento:

```bash
npm run dev:web
```

A aplicação estará disponível em `http://localhost:3000`.

## Build para Produção

Para gerar a versão otimizada de produção:

```bash
npm run build:web
```
