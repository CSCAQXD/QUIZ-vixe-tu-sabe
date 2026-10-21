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

## Incidente de seguranca

Revogue credenciais afetadas, restrinja acesso, preserve evidencias e use um Security Advisory privado. Depois da contencao, corrija a causa, valide o CI, rotacione segredos relacionados e documente a linha do tempo sem dados sensiveis.

## Encerramento

Registre causa raiz, impacto, periodo, correcao, evidencias de recuperacao e a acao preventiva responsavel.
