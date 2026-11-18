# Runbook operacional

## Triagem inicial

1. Confirme o alcance: um usuario, uma rota ou toda a aplicacao.
2. Consulte `/health` e `/ready` separadamente.
3. Localize o `X-Request-ID` da falha nos logs JSON.
4. Confira espaco em disco, permissoes do volume, uso de memoria e reinicios.
5. Compare a versao implantada com a ultima versao saudavel.
6. No Windows, confirme que o usuário entrou na sessão e que Docker Desktop está `running`.
7. Preserve banco e logs antes de ações destrutivas.

## Cenários comuns

### O sistema não abre depois de reiniciar o Windows

```powershell
docker desktop status
docker desktop start
Set-Location C:\VixeTuSabe
docker compose up -d
docker compose ps
```

Ative a inicialização do Docker Desktop no login conforme [Servidor Windows](SERVIDOR_WINDOWS.md#inicialização-automática). Os contêineres só podem reiniciar depois que o Docker Engine estiver ativo.

### `/health` responde e `/ready` falha

O processo esta ativo, mas o banco nao esta acessivel. Verifique `DATABASE_URL`, montagem do volume, permissoes, espaco e integridade do SQLite. Nao apague nem recrie o banco antes de preservar uma copia.

### Frontend abre, mas chamadas `/api` falham

Confirme `BACKEND_URL` no container frontend, resolucao do servico `backend`, prontidao da API e logs do Nginx. Em deploy de mesma origem, o bundle deve usar `/api`.

```powershell
docker compose logs --tail 100 backend
docker compose logs --tail 100 frontend
```

### O endereço `vixetusabe` não resolve

Teste primeiro o IPv4 e o nome real do servidor. Se ambos abrirem, reconfigure o alias no notebook ou limpe o cache DNS. Não altere CORS para `*` como solução de resolução de nomes.

### Muitas respostas `429`

Procure abuso ou repeticao acidental no cliente. Valide `TRUST_PROXY` antes de aumentar limites; configuracao incorreta pode agrupar todos os usuarios no mesmo IP ou permitir falsificacao.

### Disco proximo do limite

Interrompa deploys e escritas nao essenciais, preserve um backup fora do host e identifique crescimento de banco, logs ou imagens. Nao remova arquivos sem confirmar o caminho e a politica de retencao.

### Planilha indisponivel ou atualizacao rejeitada

As partidas continuam usando a versao ativa do SQLite. Nao tente substituir o banco nem editar as tabelas manualmente. Confira a publicacao da planilha e corrija todas as linhas indicadas pela tela `/administracao/perguntas`; em seguida, execute a validacao novamente. Uma tentativa rejeitada nunca altera as perguntas ativas.

### Perguntas incorretas depois de uma publicacao

Abra `/administracao/perguntas`, localize a ultima versao saudavel no historico e use **Restaurar**. Teste uma partida e depois corrija a planilha. A restauracao troca somente a versao ativa; nao apaga rankings, sessoes ou o historico.

### Administração recusa a senha

- `401`: senha incorreta; confira o valor sem publicá-lo.
- `503`: `PERGUNTAS_ADMIN_TOKEN` não está configurado ou tem menos de 16 caracteres.
- erro de conexão: confirme `/api/ready` e o proxy.

Depois de trocar a senha no `.env`, recrie o backend:

```powershell
docker compose up -d --force-recreate backend
```

### Exportação não abre no Google Planilhas

Confirme que o arquivo termina em `.xlsx` e que o navegador não renomeou o download para `.xml`. Faça upload do arquivo no Google Drive e escolha **Abrir com > Google Planilhas**. A aba **Interno por escola** deve possuir filtro no cabeçalho **Escola**.

### Escolas antigas aparecem no ranking interno

O seletor deve usar apenas escolas com pontuação no ano atual. Atualize para a versão que contém essa correção e confirme o ano do sistema. Cadastros antigos podem continuar na tabela de escolas, mas não devem aparecer sem partidas no ranking consultado.

### Sessão falha após a última pergunta

Não inicie outra partida imediatamente. Use **Tentar novamente** para reaproveitar a mesma chave de idempotência. Anote o `X-Request-ID` se a falha persistir e procure o evento nos logs do backend.

### Servidor novo sem internet

Um banco vazio nao possui perguntas para servir. Conecte o servidor temporariamente, execute a primeira importacao e confirme a versao ativa antes de leva-lo para uso offline. Em uma troca de computador, prefira restaurar um backup completo do SQLite.

## Incidente de seguranca

Revogue credenciais afetadas, restrinja acesso, preserve evidencias e use um Security Advisory privado. Depois da contencao, corrija a causa, valide o CI, rotacione segredos relacionados e documente a linha do tempo sem dados sensiveis.

Uma senha exposta em chat ou captura de tela deve ser trocada mesmo que o repositório seja privado. Remover uma mensagem ou commit não revoga o segredo.

## Encerramento

Registre causa raiz, impacto, periodo, correcao, evidencias de recuperacao e a acao preventiva responsavel.
