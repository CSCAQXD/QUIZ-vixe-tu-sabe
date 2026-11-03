# Arquitetura

## Visao geral

O projeto e um monorepo com frontend React/Vite e API Express. Em producao, um Nginx sem privilegios entrega os arquivos estaticos e encaminha `/api` ao backend. O backend acessa SQLite por Prisma.

```text
Google Sheets -> validacao manual -> versoes no SQLite
                                        ^
cliente -> frontend/Nginx -> /api -> Express
```

## Responsabilidades

- `frontend/src`: telas, componentes, estado da sessao e cliente HTTP.
- `backend/routers`: contrato HTTP e middlewares por recurso.
- `backend/controllers`: traducao entre HTTP e casos de uso.
- `backend/services`: regras de negocio e persistencia.
- `backend/prisma`: schema, migracoes e dados iniciais.
- `backend/middlewares`: erros, contexto da requisicao e protecoes transversais.

## Decisoes importantes

- A URL padrao do navegador e relativa (`/api`), evitando publicar `localhost` no bundle.
- O SQLite atende ao volume atual e simplifica a operacao; exige volume persistente e apenas uma instancia de escrita.
- `/health` indica que o processo HTTP responde; `/ready` confirma tambem o acesso ao banco.
- Cada resposta inclui `X-Request-ID`, reaproveitado nos logs para diagnostico.
- Escritas sensiveis recebem limitacao por IP; os valores sao configuraveis por ambiente.
- A planilha publicada e a fonte editorial, mas nao e consultada durante as partidas. Uma atualizacao e validada como rascunho e so passa a servir o quiz depois da confirmacao do mediador.
- O SQLite conserva uma unica versao ativa e o historico recente. Isso permite restaurar uma versao anterior e mantem o quiz operacional sem internet depois da primeira importacao.
- A primeira execucao sem versao ativa faz uma importacao inicial da planilha. Por isso, o servidor precisa de internet ao menos na preparacao inicial.

## Limites conhecidos

SQLite nao e adequado para varias replicas escrevendo no mesmo arquivo por armazenamento de rede. Antes de escalar horizontalmente, migre a persistencia para um banco servidor, adapte o datasource Prisma e exercite migracao e rollback.

Alteracoes de contrato devem atualizar [API.md](API.md), testes e consumidores no mesmo pull request.
