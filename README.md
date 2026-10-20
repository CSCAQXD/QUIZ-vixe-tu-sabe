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

npm run catalogo:cidades  # atualiza os municípios pelo IBGE
npm run catalogo:escolas  # atualiza as escolas pelo Censo Escolar/INEP
```

Para ver a lista completa a qualquer momento, use `npm run shortcuts`.

Os catálogos gerados ficam no próprio projeto. A busca de cidades e escolas
continua funcionando durante o cadastro sem depender de uma API externa.
