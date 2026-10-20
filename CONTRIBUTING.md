# Como contribuir

## Preparação

Requer Node.js 22 e npm. Na raiz do repositório:

```bash
npm ci
npm ci --prefix backend
npm ci --prefix frontend
```

O `npm ci` da raiz instala o hook de pre-commit. Ele formata e valida apenas os
arquivos adicionados ao commit.

## Fluxo recomendado

1. Crie uma branch curta a partir da branch principal.
2. Faça mudanças pequenas e inclua ou atualize testes.
3. Execute `npm run quality` antes de abrir o pull request.
4. Abra o pull request e aguarde CI e CodeQL passarem.
5. Faça merge somente com revisão e todos os checks verdes.

Commits não devem conter `.env`, bancos SQLite, artefatos de cobertura,
dependências instaladas ou segredos.

## Comandos de qualidade

| Comando                | Finalidade                                    |
| ---------------------- | --------------------------------------------- |
| `npm run format`       | Formata todo o repositório                    |
| `npm run format:check` | Confere formatação sem modificar arquivos     |
| `npm run lint:all`     | Executa ESLint em todo o JavaScript           |
| `npm run coverage:all` | Testa frontend e backend com cobertura mínima |
| `npm run build`        | Confirma o build de produção do frontend      |
| `npm run audit:all`    | Audita dependências com severidade alta       |
| `npm run quality`      | Executa o portão de qualidade completo        |

## Política de branches

Proteja a branch principal no GitHub com pull request obrigatório, ao menos uma
aprovação, conversas resolvidas e os checks `Quality gate`,
`Production dependency audit`, `Build production containers` e CodeQL.
