# Backup e restauracao

O banco SQLite deve estar em armazenamento persistente. Copiar o arquivo enquanto ele esta em escrita pode gerar um backup inconsistente; o comando do projeto usa a API de backup do SQLite.

## Criar backup

```bash
npm run backup:database
```

Por padrao, o arquivo e criado em `backend/backups`, ignorado pelo Git. Para outro destino:

```bash
npm run backup:database -- --output D:\backups\quiz
```

O comando informa caminho, tamanho e SHA-256. Copie o arquivo para armazenamento externo criptografado, restrinja acesso e monitore falhas. Backups locais antigos sao removidos conforme `BACKUP_RETENTION_DAYS`.

## Restaurar

1. Coloque a aplicacao em manutencao e interrompa escritas.
2. Verifique origem, data, tamanho e hash do backup.
3. Execute:

```bash
npm run restore:database -- --from D:\backups\quiz\arquivo.db --confirm
```

4. A ferramenta valida o cabecalho SQLite e preserva a base atual com o sufixo `.pre-restore-...`.
5. Execute as migracoes de producao, inicie a API e confirme `/ready` e o fluxo do quiz.

Teste a restauracao periodicamente em ambiente isolado. Um arquivo que nunca foi restaurado nao e um backup comprovado.
