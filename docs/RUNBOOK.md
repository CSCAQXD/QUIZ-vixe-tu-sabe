# Runbook operacional

## Triagem inicial

1. Confirme o alcance: um usuario, uma rota ou toda a aplicacao.
2. Consulte `/health` e `/ready` separadamente.
3. Localize o `X-Request-ID` da falha nos logs JSON.
4. Confira espaco em disco, permissoes do volume, uso de memoria e reinicios.
5. Compare a versao implantada com a ultima versao saudavel.

## Cenários comuns

### `/health` responde e `/ready` falha

O processo esta ativo, mas o banco nao esta acessivel. Verifique `DATABASE_URL`, montagem do volume, permissoes, espaco e integridade do SQLite. Nao apague nem recrie o banco antes de preservar uma copia.

### Frontend abre, mas chamadas `/api` falham

Confirme `BACKEND_URL` no container frontend, resolucao do servico `backend`, prontidao da API e logs do Nginx. Em deploy de mesma origem, o bundle deve usar `/api`.

### Muitas respostas `429`

Procure abuso ou repeticao acidental no cliente. Valide `TRUST_PROXY` antes de aumentar limites; configuracao incorreta pode agrupar todos os usuarios no mesmo IP ou permitir falsificacao.

### Disco proximo do limite

Interrompa deploys e escritas nao essenciais, preserve um backup fora do host e identifique crescimento de banco, logs ou imagens. Nao remova arquivos sem confirmar o caminho e a politica de retencao.

### Planilha indisponivel ou atualizacao rejeitada

As partidas continuam usando a versao ativa do SQLite. Nao tente substituir o banco nem editar as tabelas manualmente. Confira a publicacao da planilha e corrija todas as linhas indicadas pela tela `/administracao/perguntas`; em seguida, execute a validacao novamente. Uma tentativa rejeitada nunca altera as perguntas ativas.

### Perguntas incorretas depois de uma publicacao

Abra `/administracao/perguntas`, localize a ultima versao saudavel no historico e use **Restaurar**. Teste uma partida e depois corrija a planilha. A restauracao troca somente a versao ativa; nao apaga rankings, sessoes ou o historico.

### Servidor novo sem internet

Um banco vazio nao possui perguntas para servir. Conecte o servidor temporariamente, execute a primeira importacao e confirme a versao ativa antes de leva-lo para uso offline. Em uma troca de computador, prefira restaurar um backup completo do SQLite.

## Incidente de seguranca

Revogue credenciais afetadas, restrinja acesso, preserve evidencias e use um Security Advisory privado. Depois da contencao, corrija a causa, valide o CI, rotacione segredos relacionados e documente a linha do tempo sem dados sensiveis.

## Encerramento

Registre causa raiz, impacto, periodo, correcao, evidencias de recuperacao e a acao preventiva responsavel.
