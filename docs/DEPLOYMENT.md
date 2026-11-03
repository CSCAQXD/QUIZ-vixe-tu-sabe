# Deploy

## Pre-requisitos

- host com Docker e Compose;
- volume persistente para o arquivo SQLite;
- HTTPS no proxy ou plataforma publica;
- backup verificado antes de qualquer migracao.

## Publicacao

1. Garanta que o commit esteja na branch principal e todos os checks estejam verdes.
2. Atualize `CHANGELOG.md` e as versoes quando aplicavel.
3. Crie uma tag SemVer assinada ou protegida, por exemplo `v1.1.0`.
4. Aguarde o workflow de release publicar as imagens no GHCR.
5. Fixe no ambiente a tag exata; evite depender de `latest` para rollback.
6. Configure `DATABASE_URL`, `CORS_ORIGINS`, `TRUST_PROXY`, limites, `BACKEND_URL`, `PERGUNTAS_CSV_URL` e um `PERGUNTAS_ADMIN_TOKEN` forte e exclusivo.
7. Execute `npm run prisma:deploy` no contexto do backend.
8. Acesse `/administracao/perguntas`, valide a planilha e confirme que existe uma versao ativa.
9. Verifique `/health`, `/ready` e o fluxo principal do quiz.

## Docker Compose local

```bash
docker compose up --build -d
docker compose ps
```

Abra `http://localhost:8080`. O container frontend encaminha `/api` para `http://backend:3001`.

O primeiro carregamento de perguntas requer acesso a planilha publicada. Depois que uma versao e ativada, as partidas leem apenas o SQLite e continuam funcionando sem internet. Preserve o volume `quiz-data`; recriar esse volume apaga perguntas versionadas, rankings e sessoes.

## Rollback

Reimplante a tag anterior e, somente se o schema exigir, restaure o backup conforme [BACKUP_RESTORE.md](BACKUP_RESTORE.md). Nao aplique migracoes de desenvolvimento em producao. Registre versao, horario, operador e resultado.
