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

Por seguranca, o Compose publica apenas o frontend. O backend e o SQLite permanecem acessiveis
somente pela rede interna dos containers.

O primeiro carregamento de perguntas requer acesso a planilha publicada. Depois que uma versao e ativada, as partidas leem apenas o SQLite e continuam funcionando sem internet. Preserve o volume `quiz-data`; recriar esse volume apaga perguntas versionadas, rankings e sessoes.

## Servidor Windows em rede interna

Use este modo somente em uma rede confiavel e exclusiva para funcionarios. No PowerShell, dentro
do repositorio:

```powershell
.\scripts\configurar-deploy-interno.ps1
docker compose config
docker compose up --build -d
docker compose ps
```

Em um PowerShell executado como administrador, libere apenas a porta do frontend para a sub-rede
local e somente no perfil privado:

```powershell
.\scripts\liberar-firewall-rede-interna.ps1
```

Os funcionarios acessam `http://NOME-DO-SERVIDOR:8080`. Nao encaminhe a porta 8080 no roteador e
nao publique a porta 3001. O arquivo `.env` contem segredos e nao deve ser copiado para mensagens,
Issues ou commits.

Crie um backup consistente do SQLite dentro da pasta local `backups` com:

```powershell
docker compose exec -T backend node scripts/backupDatabase.js
```

Copie periodicamente essa pasta para uma unidade externa criptografada e teste a restauracao em
ambiente isolado.

## Rollback

Reimplante a tag anterior e, somente se o schema exigir, restaure o backup conforme [BACKUP_RESTORE.md](BACKUP_RESTORE.md). Nao aplique migracoes de desenvolvimento em producao. Registre versao, horario, operador e resultado.
