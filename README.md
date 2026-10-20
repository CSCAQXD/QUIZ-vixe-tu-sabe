# QUIZ-vixe-tu-sabe

## Atalhos do projeto

Execute os comandos abaixo na pasta raiz do projeto:

```bash
npm run dev backend       # inicia a API
npm run dev frontend      # inicia o site
npm run dev:all           # inicia API e site juntos

npm run test backend      # testes do backend
npm run test frontend     # testes do frontend
npm run test:all          # todos os testes
npm run coverage:all      # cobertura de testes completa

npm run build frontend    # build de produção do site
npm run lint frontend     # lint do site
npm run check:backend     # valida o backend e o Prisma
npm run install:all       # instala todas as dependências
npm run audit:all         # audita raiz, backend e frontend

npm run catalogo:cidades  # atualiza os municípios pelo IBGE
npm run catalogo:escolas  # atualiza as escolas pelo Censo Escolar/INEP
```

Para ver a lista completa a qualquer momento, use `npm run shortcuts`.

Os catálogos gerados ficam no próprio projeto. A busca de cidades e escolas
continua funcionando durante o cadastro sem depender de uma API externa.

## Qualidade e CI/CD

O repositório usa Prettier, ESLint, Husky e lint-staged. Antes de abrir
um pull request, execute:

```bash
npm run quality
```

O GitHub Actions valida formatação, lint, schema Prisma, testes com cobertura,
build, dependências e imagens Docker. CodeQL analisa vulnerabilidades toda semana.
O Dependabot verifica pacotes npm, imagens Docker e Actions toda segunda-feira.
Atualizações compatíveis são agrupadas e versões principais permanecem em PRs
separados; correções de segurança continuam sendo abertas sem o período de espera.

Pushes na branch principal e tags no formato `v1.2.3` publicam duas imagens no
GitHub Container Registry: `quiz-vixe-tu-sabe-backend` e
`quiz-vixe-tu-sabe-frontend`.

## Executar como produção local

Defina uma chave forte e inicie os serviços:

```bash
# PowerShell
$env:QUIZ_CONTEXT_SECRET = node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
docker compose up --build
```

O site ficará em `http://localhost:8080` e a API em `http://localhost:3001`.
O banco SQLite é persistido no volume `quiz-data` e as migrações são executadas
antes da inicialização da API.

Consulte [CONTRIBUTING.md](CONTRIBUTING.md) para o fluxo de contribuição e
[SECURITY.md](SECURITY.md) para comunicar vulnerabilidades.
