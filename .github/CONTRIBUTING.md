# Como contribuir

Obrigado por ajudar a manter o Quiz Vixe, Tu Sabe?. Mudancas pequenas, testadas e bem documentadas tornam a revisao mais segura.

## Preparacao

Use Node.js `22.23.2` e npm 10 ou superior. Na raiz:

```bash
npm ci
npm ci --prefix backend
npm ci --prefix frontend
```

O `npm ci` da raiz instala o hook de pre-commit. Ele formata e valida os arquivos adicionados ao commit.

## Fluxo recomendado

1. Atualize a branch principal e crie `<tipo>/<descricao-curta>`, por exemplo `fix/corrigir-ranking`.
2. Faca uma mudanca coesa e inclua ou atualize seus testes.
3. Execute `npm run quality`, `npm run audit:all` e, quando afetar a jornada, `npm --prefix frontend run test:e2e`.
4. Use [Conventional Commits](https://www.conventionalcommits.org/), por exemplo `fix(api): validar escola da sessao`.
5. Abra um pull request com contexto, como testar, riscos e evidencias.
6. Faca merge somente depois da revisao, das conversas resolvidas e de todos os checks obrigatorios.

Commits nao devem conter `.env`, bancos SQLite, backups, cobertura, dependencias instaladas ou segredos.

## Comandos de qualidade

| Comando                | Finalidade                                    |
| ---------------------- | --------------------------------------------- |
| `npm run format`       | Formata todo o repositorio                    |
| `npm run format:check` | Confere formatacao sem modificar arquivos     |
| `npm run lint:all`     | Executa ESLint em todo o JavaScript           |
| `npm run coverage:all` | Testa frontend e backend com cobertura minima |
| `npm run build`        | Confirma o build de producao do frontend      |
| `npm run audit:all`    | Audita as tres arvores de dependencias        |
| `npm run quality`      | Executa o portao de qualidade completo        |

## Dependencias

O Dependabot verifica atualizacoes mensalmente. Ele sugere mudancas; nao e um contribuidor humano nem deve receber merge automatico. Para cada PR:

1. leia changelog e possiveis breaking changes;
2. confirme que os lockfiles mudaram somente como esperado;
3. reproduza manualmente a atualizacao numa branch do mantenedor quando desejar que o historico atribua a mudanca ao projeto;
4. execute o portao de qualidade, auditoria, E2E e builds de container;
5. feche propostas duplicadas ou substituidas.

Atualizacoes major devem ser tratadas individualmente. Nao reduza limiares, ignore vulnerabilidades ou desative testes apenas para deixar o CI verde.

## Protecao da branch principal

Exija pull request, uma aprovacao, conversas resolvidas, branch atualizada, historico linear e os checks `Quality gate`, `E2E smoke`, `Production dependency audit`, `Build production containers` e CodeQL. Bloqueie force-push e exclusao.

Consulte [Releases](../docs/RELEASES.md) e [Deploy](../docs/DEPLOYMENT.md) antes de publicar.
