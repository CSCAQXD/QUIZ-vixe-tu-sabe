# API

Base local: `http://localhost:3001`. Pelo frontend de producao: `/api`.

As respostas JSON de erro seguem, em geral:

```json
{
  "erro": "Descricao segura para o cliente",
  "requestId": "identificador-da-requisicao"
}
```

## Operacao

| Metodo | Rota      | Descricao                             |
| ------ | --------- | ------------------------------------- |
| `GET`  | `/health` | Confirma que o processo responde      |
| `GET`  | `/ready`  | Confirma processo e banco disponiveis |

## Quiz e catalogos

| Metodo | Rota                        | Descricao                                   |
| ------ | --------------------------- | ------------------------------------------- |
| `GET`  | `/perguntas`                | Lista perguntas do quiz                     |
| `GET`  | `/perguntas/:id`            | Consulta uma pergunta                       |
| `GET`  | `/cidades`                  | Lista cidades disponiveis                   |
| `GET`  | `/escolas`                  | Lista escolas, com filtros aceitos pela API |
| `GET`  | `/escolas/:escolaId/cursos` | Lista cursos da escola                      |
| `POST` | `/escolas/:escolaId/cursos` | Cria curso; sujeito a rate limit            |
| `GET`  | `/rankings`                 | Consulta classificacoes                     |
| `POST` | `/sessao`                   | Registra uma sessao; sujeito a rate limit   |

O contrato detalhado de campos e validacoes fica nos routers, validators e testes do backend. Ao integrar, trate `400`, `404`, `409`, `429` e `500`; preserve `X-Request-ID` ao relatar falhas.

## CORS e proxy

No desenvolvimento, configure `CORS_ORIGINS` com as origens permitidas. Em producao, prefira o acesso de mesma origem pelo proxy `/api`; nunca use `*` quando houver credenciais.
