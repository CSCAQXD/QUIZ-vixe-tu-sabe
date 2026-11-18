# Referência da API

Base em desenvolvimento: `http://localhost:3001`. Pelo frontend em produção: `/api`.

## Convenções

- Requisições e respostas usam JSON, exceto importação CSV e exportação XLSX.
- Anos válidos: inteiros entre 2000 e 2100.
- `limit` dos rankings: inteiro entre 1 e 100; quando omitido, retorna a lista completa.
- Respostas incluem `X-Request-ID`. Informe esse valor ao relatar uma falha.
- Escritas podem retornar `429` por limitação de taxa.

Formato comum de erro:

```json
{
  "erro": "Descrição segura para o cliente",
  "codigo": "CODIGO_PUBLICO_OPCIONAL",
  "requestId": "identificador-da-requisicao"
}
```

## Saúde

### `GET /health`

Confirma que o processo HTTP responde. Não verifica o banco.

### `GET /ready`

Executa uma consulta simples no SQLite. Retorna `200` com `{ "status": "ready" }` ou `503` quando o banco não está disponível.

## Perguntas do quiz

### `GET /perguntas`

Sem parâmetros, retorna todas as perguntas da versão ativa. Para selecionar a faixa, repita `turma`:

```text
GET /perguntas?turma=FUNDAMENTAL:4&turma=MEDIO:2
```

Valores aceitos: `FUNDAMENTAL:1` a `FUNDAMENTAL:9` e `MEDIO:1` a `MEDIO:3`. São aceitas até 100 turmas na mediação.

Resposta com turmas:

```json
{
  "total": 50,
  "perguntas": [],
  "categoriaQuiz": "FUNDAMENTAL_1",
  "contextoQuiz": "conteudo-assinado.assinatura"
}
```

O `contextoQuiz` deve ser enviado sem alteração ao registrar a sessão. Ele expira em quatro horas e comprova as turmas e a categoria realmente utilizadas.

## Escolas e cursos

### `GET /escolas`

Lista os cadastros persistidos no banco. Resposta: `{ "total": 1, "escolas": [] }`.

### `GET /escolas/catalogo`

Busca escolas no catálogo oficial usado no cadastro.

| Parâmetro         | Obrigatório | Regra                             |
| ----------------- | ----------- | --------------------------------- |
| `municipioIbgeId` | Sim         | Código IBGE com 7 dígitos         |
| `q`               | Não         | Parte do nome da escola           |
| `limit`           | Não         | Quantidade de sugestões; padrão 8 |

### `GET /escolas/:escolaId/cursos`

Lista os cursos associados à escola.

### `POST /escolas/:escolaId/cursos`

Cria um curso quando o nome ainda não existe. Corpo:

```json
{
  "nome": "Técnico em Informática",
  "confirmar": true
}
```

O serviço normaliza acentos, caixa, prefixos e aliases conhecidos para evitar duplicidades.

## Sessões

### `POST /sessao`

Registra o resultado de uma escola. O alias `POST /sessoes` também é aceito.

```json
{
  "nomeEscola": "EEEP Exemplo",
  "cidade": "Quixadá",
  "cidadeUf": "CE",
  "municipioIbgeId": "2311306",
  "codigoInep": "12345678",
  "idempotencyKey": "identificador-unico-da-partida",
  "pontuacaoFinal": 900,
  "contextoQuiz": "conteudo-assinado.assinatura",
  "turmas": [
    {
      "etapaEnsino": "MEDIO",
      "serie": 2,
      "turma": "A",
      "tipoOrganizacao": "TECNICA",
      "organizacaoTurma": "DIVIDIDA",
      "cursoNome": "Técnico em Informática"
    }
  ]
}
```

Regras principais:

- `idempotencyKey`: 8 a 100 caracteres;
- `pontuacaoFinal`: inteiro maior ou igual a zero;
- até 20 turmas por registro;
- `etapaEnsino`: `FUNDAMENTAL` ou `MEDIO`;
- série 1 a 9 no Fundamental e 1 a 3 no Médio;
- turma com 1 a 30 caracteres;
- curso obrigatório para `TECNICA` e proibido para `REGULAR`;
- código INEP, quando informado, deve ter 8 dígitos.

Retorna `201` em um novo registro e `200` se a chave de idempotência já tiver sido registrada. A repetição não duplica pontuação.

### `GET /sessao/:id`

Consulta uma partida pelo UUID. O alias `/sessoes/:id` também é aceito.

### `GET /sessao/escola/:escolaId/historico?ano=2026`

Lista partidas da escola, opcionalmente filtradas por ano. O alias sob `/sessoes` também é aceito.

## Rankings

As quatro rotas aceitam `ano` e `limit`:

| Rota                                | Resultado                       |
| ----------------------------------- | ------------------------------- |
| `GET /ranking-turmas`               | Classificação geral das turmas  |
| `GET /ranking-escolas`              | Pontuação agregada por escola   |
| `GET /ranking-interno/:escolaId`    | Turmas de uma escola            |
| `GET /ranking-categoria/:categoria` | Turmas da categoria selecionada |

Categorias: `FUNDAMENTAL_1`, `FUNDAMENTAL_2` e `MEDIO`.

Exemplo:

```text
GET /ranking-categoria/MEDIO?ano=2026&limit=20
```

As posições são densas: empates ocupam a mesma posição e a próxima pontuação recebe a posição seguinte, sem saltos.

## Autenticação administrativa

As rotas abaixo exigem uma das opções:

```http
Authorization: Bearer SENHA_ADMINISTRATIVA
```

ou:

```http
X-Admin-Token: SENHA_ADMINISTRATIVA
```

A configuração ausente retorna `503`; senha inválida retorna `401`.

## Administração das perguntas

### `GET /perguntas/admin/status`

Retorna a versão ativa e até as 20 versões recentes, sem incluir o conteúdo das perguntas.

### `GET /perguntas/admin/versoes/:id`

Retorna o conteúdo de uma versão para revisão autenticada.

### `POST /perguntas/admin/validar-arquivo`

Corpo CSV com `Content-Type: text/csv; charset=utf-8` ou `text/plain`, limitado a 2 MB. Valida o arquivo inteiro, cria um rascunho e calcula perguntas adicionadas, alteradas e removidas. Não publica automaticamente.

### `POST /perguntas/admin/versoes/:id/ativar`

Ativa um rascunho ou restaura uma versão anterior. A versão antes ativa passa ao histórico.

### `DELETE /perguntas/admin/versoes/:id`

Exclui uma versão inativa. Além do cabeçalho autenticado, exige nova senha no corpo:

```json
{
  "senhaAdministrativa": "senha-confirmada"
}
```

A versão ativa não pode ser excluída.

## Administração dos rankings

### `GET /admin/rankings/exportar?ano=2026`

Retorna `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` com o nome `vixe-tu-sabe-rankings-ANO.xlsx`.

O arquivo possui seis abas fixas: Turmas, Escolas, Fundamental I, Fundamental II, Ensino Médio e Interno por escola. A última reúne todas as escolas e usa o filtro do cabeçalho para seleção.

### `POST /admin/rankings/reiniciar`

```json
{
  "ano": 2026,
  "senhaAdministrativa": "senha-confirmada",
  "confirmacao": "APAGAR DADOS DE 2026"
}
```

Remove partidas e participações somente do ano informado. Perguntas, versões, escolas e cursos são preservados.

## CORS e proxy

No desenvolvimento, `CORS_ORIGINS` pode aceitar a origem do Vite. Em produção, use a mesma origem pelo proxy `/api`. Não use `*` em um ambiente exposto e configure `TRUST_PROXY` apenas quando souber quantos proxies confiáveis existem antes da API.
