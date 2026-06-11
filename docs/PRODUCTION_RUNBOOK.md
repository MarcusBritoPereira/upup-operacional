# Runbook de produção — UP Gestão Operacional

## Pré-deploy

1. Validar que a branch está verde:
   - `npm run migration:check`
   - `npm run lint`
   - `npm run typecheck`
   - `npm test`
   - `npm run test:e2e`
   - `npm run build`
2. Conferir `.env.production` no servidor usando `.env.production.example` como base.
3. Garantir que `CREDENTIALS_ENCRYPTION_KEY`, `JWT_SECRET` e `POSTGRES_PASSWORD` estão em cofre seguro.
4. Confirmar janela de deploy e responsável por rollback.

## Deploy

Use `scripts/deploy.sh`. O script:

1. valida variáveis obrigatórias;
2. sincroniza artefatos;
3. constrói imagens;
4. cria backup do PostgreSQL;
5. executa migrations;
6. sobe serviços;
7. valida health checks locais.

## Verificação pós-deploy

- `curl -fsS https://operacional.upsystem.cloud/api/health/ready`
- Acessar `/login`.
- Fazer login com usuário autorizado.
- Abrir `/dashboard`, `/clients` e um cliente real.
- Validar criação/edição de um item não destrutivo em staging antes de produção.

## Rollback

1. Se a aplicação ficar indisponível, voltar para o commit/imagem anterior.
2. Se a falha envolver migration incompatível, restaurar o backup mais recente criado em `backups/`.
3. Preservar logs antes de limpar containers.
4. Registrar causa, impacto, horário e ação corretiva.

## Backups

- `scripts/backup-postgres.sh` cria dumps no formato custom do PostgreSQL.
- Backups de produção devem ser copiados para armazenamento fora da VPS.
- Testar restauração periodicamente em ambiente isolado.

## Segurança operacional

- Não usar senhas padrão em produção.
- Manter `COOKIE_SECURE=true` e `REQUIRE_TRUSTED_ORIGIN=true`.
- Rotacionar `CREDENTIALS_ENCRYPTION_KEY` com plano específico, pois ela protege senhas de clientes.
- Auditar acessos a senhas de clientes pela tabela `credential_access_logs`.
