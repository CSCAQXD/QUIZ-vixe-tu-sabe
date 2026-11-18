# Deploy

## Pre-requisitos

- host com Docker e Compose;
- volume persistente para o arquivo SQLite;
- HTTPS no proxy ou plataforma publica;
- backup verificado antes de qualquer migracao.

Para o servidor Windows da Casa de Saberes, siga primeiro o [guia específico do servidor](SERVIDOR_WINDOWS.md). Este documento também cobre cenários genéricos de publicação.

## Publicacao

1. Garanta que o commit esteja na branch principal e todos os checks estejam verdes.
2. Atualize `CHANGELOG.md` e as versoes quando aplicavel.
3. Crie uma tag SemVer assinada ou protegida, por exemplo `v1.1.0`.
4. Aguarde o workflow de release publicar as imagens no GHCR.
5. Fixe no ambiente a tag exata; evite depender de `latest` para rollback.
6. Configure `DATABASE_URL`, `CORS_ORIGINS`, `TRUST_PROXY`, limites, `BACKEND_URL` e um `PERGUNTAS_ADMIN_TOKEN` forte e exclusivo.
7. Execute `npm run prisma:deploy` no contexto do backend.
8. Abra a Administracao, envie o CSV privado e confirme que existe uma versao ativa.
9. Verifique `/health`, `/ready` e o fluxo principal do quiz.

## Docker Compose local

```bash
docker compose up --build -d
docker compose ps
```

Abra `http://localhost:8080`. O container frontend encaminha `/api` para `http://backend:3001`.

Por seguranca, o Compose publica apenas o frontend. O backend e o SQLite permanecem acessiveis
somente pela rede interna dos containers.

As perguntas entram somente por um CSV enviado na Administracao. Depois que uma versao e ativada, as partidas leem apenas o SQLite e continuam funcionando sem internet. Preserve o volume `quiz-data`; recriar esse volume apaga perguntas versionadas, rankings e sessoes.

Nunca execute `docker compose down -v` em produção. O sufixo `-v` remove o volume persistente.

## Servidor Windows em rede interna

Use este modo somente em uma rede confiável e exclusiva para funcionários. O procedimento completo, incluindo instalação, endereço curto, firewall, inicialização automática e diagnóstico, está em [Servidor Windows](SERVIDOR_WINDOWS.md).

Resumo da primeira publicação, no PowerShell dentro do repositório:

```powershell
.\scripts\configurar-deploy-interno.ps1
docker compose config
docker compose up --build -d
docker compose ps
```

Defina uma senha administrativa legivel, sem exibir ou substituir os demais segredos:

```powershell
.\scripts\definir-senha-administracao.ps1
docker compose up -d --force-recreate backend
```

Na tela inicial, use o botao **Administracao** para enviar, revisar e publicar o CSV baixado da planilha privada.

Para testar essa area no navegador de desenvolvimento, defina uma senha exclusiva no arquivo ignorado `backend/.env` sem publica-la no Git:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\definir-senha-administracao.ps1 -Local
npm run dev:all
```

Antes do fechamento anual, use **Exportar rankings** na Administracao e guarde a planilha em local seguro. Na aba **Interno por escola**, use o filtro da coluna **Escola** para consultar as instituicoes sem criar uma aba separada para cada uma. Depois de conferir o arquivo, a opcao **Reiniciar rankings** apaga partidas e participacoes do ano mediante nova confirmacao da senha administrativa e frase de seguranca. Perguntas, escolas e cursos sao preservados.

Para popular somente o banco SQLite local de desenvolvimento com escolas, turmas e partidas ficticias organizadas, execute em `backend`:

```powershell
npm run dados:teste -- --ano=2026
```

O script substitui apenas os dados ficticios do mesmo ano criados por ele. Registros reais permanecem intactos, e a execucao e recusada quando `NODE_ENV=production`.

Em um PowerShell executado como administrador, libere apenas a porta do frontend para a sub-rede
local e somente no perfil privado:

```powershell
.\scripts\liberar-firewall-rede-interna.ps1
```

Para oferecer o endereco curto `http://vixetusabe`, reserve primeiro o IPv4 do servidor no DHCP
do roteador. Depois, no servidor, atualize a configuracao e a regra de firewall:

```powershell
.\scripts\configurar-url-interna.ps1
.\scripts\liberar-firewall-rede-interna.ps1 -Port 80
docker compose up -d
```

Em cada notebook autorizado, copie o script de configuracao e execute em um PowerShell aberto como
administrador, informando o IPv4 reservado do servidor:

```powershell
.\configurar-cliente-rede-interna.ps1 -ServerAddress 192.168.0.6
```

Os funcionarios passam a acessar `http://vixetusabe`. Nao encaminhe as portas 80, 8080 ou 3001 no
roteador. O arquivo `.env` contem segredos e nao deve ser copiado para mensagens, Issues ou commits.

Crie um backup consistente do SQLite dentro da pasta local `backups` com:

```powershell
docker compose exec -T backend node scripts/backupDatabase.js
```

Copie periodicamente essa pasta para uma unidade externa criptografada e teste a restauracao em
ambiente isolado.

## Checklist pós-publicação

1. `docker compose ps` mostra backend e frontend saudáveis.
2. `/health` retorna `200`.
3. `/api/ready` retorna `ready` pelo frontend.
4. A tela inicial abre em um notebook autorizado.
5. A Administração aceita a senha nova.
6. Existe uma versão ativa de perguntas.
7. Uma partida de teste é salva e aparece nos rankings.
8. A exportação XLSX abre e possui as seis abas esperadas.
9. Um backup foi criado e copiado para fora do computador servidor.
10. As portas do quiz não estão encaminhadas no roteador.

## Rollback

Reimplante a tag anterior e, somente se o schema exigir, restaure o backup conforme [BACKUP_RESTORE.md](BACKUP_RESTORE.md). Nao aplique migracoes de desenvolvimento em producao. Registre versao, horario, operador e resultado.

Não faça rollback apagando o volume ou copiando um SQLite enquanto ele está em escrita. Preserve evidências e a base atual antes de qualquer restauração.
