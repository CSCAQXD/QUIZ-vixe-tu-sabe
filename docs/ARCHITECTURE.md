# Arquitetura

## Visao geral

O projeto e um monorepo com frontend React/Vite e API Express. Em producao, um Nginx sem privilegios entrega os arquivos estaticos e encaminha `/api` ao backend. O backend acessa SQLite por Prisma.

```text
cliente -> frontend/Nginx -> /api -> Express -> Prisma -> SQLite
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

## Limites conhecidos

SQLite nao e adequado para varias replicas escrevendo no mesmo arquivo por armazenamento de rede. Antes de escalar horizontalmente, migre a persistencia para um banco servidor, adapte o datasource Prisma e exercite migracao e rollback.

Alteracoes de contrato devem atualizar [API.md](API.md), testes e consumidores no mesmo pull request.
