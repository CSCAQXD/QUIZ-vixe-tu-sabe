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
| `GET`  | `/cidades`                  | Lista cidades disponiveis                   |
| `GET`  | `/escolas`                  | Lista escolas, com filtros aceitos pela API |
| `GET`  | `/escolas/:escolaId/cursos` | Lista cursos da escola                      |
| `POST` | `/escolas/:escolaId/cursos` | Cria curso; sujeito a rate limit            |
| `GET`  | `/rankings`                 | Consulta classificacoes                     |
| `POST` | `/sessao`                   | Registra uma sessao; sujeito a rate limit   |

O contrato detalhado de campos e validacoes fica nos routers, validators e testes do backend. Ao integrar, trate `400`, `404`, `409`, `429` e `500`; preserve `X-Request-ID` ao relatar falhas.

## Administracao das perguntas

As rotas abaixo exigem `Authorization: Bearer <PERGUNTAS_ADMIN_TOKEN>` e nao sao usadas durante uma partida:

| Metodo | Rota                                  | Descricao                                     |
| ------ | ------------------------------------- | --------------------------------------------- |
| `GET`  | `/perguntas/admin/status`             | Mostra a versao ativa e as ultimas 20 versoes |
| `POST` | `/perguntas/admin/validar-arquivo`    | Valida o CSV e cria uma versao em rascunho    |
| `POST` | `/perguntas/admin/versoes/:id/ativar` | Publica ou restaura a versao escolhida        |

O corpo de `/validar-arquivo` deve ser o conteúdo do CSV, com `Content-Type: text/csv`, limitado a 2 MB. A validacao rejeita a importacao inteira se houver linha incompleta, alternativa ausente, resposta correta invalida, pontuacao invalida, faixa desconhecida ou ID duplicado. Validar nunca publica automaticamente. A resposta apresenta os IDs adicionados, alterados e removidos para revisao antes da ativacao.

## CORS e proxy

No desenvolvimento, configure `CORS_ORIGINS` com as origens permitidas. Em producao, prefira o acesso de mesma origem pelo proxy `/api`; nunca use `*` quando houver credenciais.
