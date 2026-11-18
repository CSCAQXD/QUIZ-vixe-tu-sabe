# Backup e restauracao

O banco SQLite deve estar em armazenamento persistente. Copiar o arquivo enquanto ele esta em escrita pode gerar um backup inconsistente; o comando do projeto usa a API de backup do SQLite.

## Criar backup

### Servidor com Docker Compose

Na raiz do repositório:

```powershell
docker compose exec -T backend node scripts/backupDatabase.js
```

O arquivo é gravado em `backups` no computador servidor, porque essa pasta está montada em `/backups` no contêiner.

### Desenvolvimento local

```bash
npm run backup:database
```

Por padrao, o arquivo e criado em `backend/backups`, ignorado pelo Git. Para outro destino:

```bash
npm run backup:database -- --output D:\backups\quiz
```

O comando informa caminho, tamanho e SHA-256. Copie o arquivo para armazenamento externo criptografado, restrinja acesso e monitore falhas. Backups locais antigos sao removidos conforme `BACKUP_RETENTION_DAYS`.

Registre pelo menos data, responsável, hash e local da cópia externa. O banco contém perguntas, escolas, partidas e rankings; trate o backup como dado restrito.

## Restaurar no desenvolvimento local

1. Coloque a aplicacao em manutencao e interrompa escritas.
2. Verifique origem, data, tamanho e hash do backup.
3. Execute:

```bash
npm run restore:database -- --from D:\backups\quiz\arquivo.db --confirm
```

4. A ferramenta valida o cabecalho SQLite e preserva a base atual com o sufixo `.pre-restore-...`.
5. Execute as migracoes de producao, inicie a API e confirme `/ready` e o fluxo do quiz.

## Restaurar no servidor com Docker Compose

1. Avise os funcionários e interrompa o uso.
2. Confirme que o arquivo está dentro de `C:\VixeTuSabe\backups`.
3. Pare os serviços que escrevem no banco:

```powershell
Set-Location C:\VixeTuSabe
docker compose stop frontend backend
```

4. Restaure usando um contêiner temporário ligado ao mesmo volume:

```powershell
docker compose run --rm --no-deps backend node scripts/restoreDatabase.js --from /backups/ARQUIVO.db --confirm
```

5. Aplique migrações e inicie novamente:

```powershell
docker compose run --rm migrate
docker compose up -d
docker compose ps
Invoke-WebRequest http://localhost/health -UseBasicParsing
Invoke-RestMethod http://localhost/api/ready
```

6. Verifique versão ativa, rankings e uma partida de teste.

A restauração renomeia o banco anterior com sufixo `.pre-restore-...`. Não apague essa cópia até concluir a validação.

## O que não fazer

- Não copie `quiz.db` enquanto o backend está recebendo partidas.
- Não restaure por cima do volume com os contêineres ativos.
- Não use `docker compose down -v`.
- Não guarde a única cópia no mesmo SSD do servidor.
- Não considere um backup válido sem testar a restauração.

Teste a restauracao periodicamente em ambiente isolado. Um arquivo que nunca foi restaurado nao e um backup comprovado.
