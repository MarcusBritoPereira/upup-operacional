# Production Readiness Hardening

## Goal
Preparar o projeto para um deploy de produção mais seguro e verificável, removendo bloqueadores de build, reduzindo exposição de segredos e melhorando deploy/observabilidade.

## Tasks
- [x] Corrigir dependências/build/lint bloqueantes → Verify: `npm run lint`, `npm run typecheck`, `npm run build`.
- [x] Self-host da fonte e headers de segurança no frontend → Verify: build sem fetch de Google Fonts.
- [x] Criptografar credenciais e limitar respostas sensíveis → Verify: testes de credentials e schema atualizado.
- [x] Reforçar auth/CSRF/RBAC/env em API → Verify: testes de env/origin/users.
- [x] Fortalecer Docker/deploy/backup/healthchecks → Verify: compose e scripts validáveis por shell/static checks.
- [x] Atualizar docs/runbook/env examples → Verify: README/runbook refletem produção.

## Done When
- [x] Checks automatizados passam ou limitações de ambiente ficam documentadas.
- [x] Mudanças estão commitadas e PR criado.
