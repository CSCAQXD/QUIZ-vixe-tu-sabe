# Guia de desenvolvimento

## Requisitos

- Node.js `22.23.2`, conforme `.nvmrc`;
- npm 10 ou superior;
- Git;
- Docker Desktop opcional para testar a imagem de produção.

## Instalação

Na raiz do repositório:

```powershell
npm ci
npm ci --prefix backend
npm ci --prefix frontend
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
npm run prisma:generate
npm run prisma:deploy
```

Defina uma senha administrativa local sem publicá-la:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\definir-senha-administracao.ps1 -Local
```

## Executar

Para iniciar frontend e backend juntos:

```powershell
npm run dev:all
```

- Frontend: `http://localhost:5173`.
- Backend: `http://localhost:3001`.

Se o proxy do Vite apresentar `ETIMEDOUT`, execute em terminais separados:

```powershell
npm run dev:backend
```

```powershell
npm run dev:frontend
```

## Banco local

O desenvolvimento usa `backend/prisma/dev.db` quando `DATABASE_URL` aponta para `file:./dev.db`. Execute migrações de desenvolvimento apenas no ambiente local:

```powershell
npm run prisma:migrate
```

Para aplicar migrações já versionadas:

```powershell
npm run prisma:deploy
```

Não publique o banco local nem use `prisma migrate dev` no servidor de produção.

## Dados fictícios para rankings

```powershell
npm --prefix backend run dados:teste -- --ano=2026
```

O script é recusado em `NODE_ENV=production`. Ele substitui somente os dados fictícios do mesmo ano criados pelo próprio script e preserva registros reais.

## Catálogos de municípios e escolas

Os municípios e o catálogo de escolas ficam em arquivos locais dentro de `shared`, por isso a seleção não depende de uma API externa durante o atendimento. Para atualizar esses arquivos a partir das fontes configuradas:

```powershell
npm run catalogo:cidades
npm run catalogo:escolas
```

Esses comandos exigem internet e devem ser executados em uma branch própria. Revise as alterações, valide buscas de municípios e escolas e não atualize catálogos diretamente no servidor de produção.

## Testes e qualidade

| Comando                              | Finalidade                              |
| ------------------------------------ | --------------------------------------- |
| `npm run test:all`                   | Testes do frontend e backend            |
| `npm run lint:all`                   | ESLint nos dois projetos                |
| `npm run format:check`               | Confere formatação                      |
| `npm run build`                      | Compila o frontend                      |
| `npm run quality`                    | Porta completa de qualidade e cobertura |
| `npm run audit:all`                  | Auditoria de dependências               |
| `npm --prefix frontend run test:e2e` | Fluxo crítico no navegador              |

Testes HTTP locais podem exigir permissão do ambiente para abrir portas em `127.0.0.1`.

## Convenções de Git

- Branches: `<tipo>/<descricao-curta>`, sem prefixos pessoais; exemplos `fix/ranking-escolas` e `feat/admin-exportacao`.
- Commits atômicos no padrão Conventional Commits.
- Não misture correções independentes no mesmo commit.
- Inclua testes e documentação quando o comportamento mudar.
- Nunca adicione `.env`, bancos, backups, cobertura, `node_modules` ou material editorial privado.

## Estrutura do repositório

```text
frontend/                interface React e proxy de produção
backend/                 API Express, Prisma e SQLite
backend/prisma/          schema e migrações
shared/                  catálogos estáticos usados pelos serviços
scripts/                 automações do monorepo e do servidor Windows
docs/                    documentação pública do sistema
.github/                 CI, templates e políticas do repositório
```

## Alterações de contrato

Ao alterar uma rota, payload ou variável de ambiente:

1. atualize os testes;
2. atualize [API](API.md);
3. atualize os exemplos `.env` quando necessário;
4. valide frontend e backend consumidores;
5. registre a mudança em `CHANGELOG.md` quando ela afetar usuários ou operação.
