# Quiz Vixe, Tu Sabe?

Aplicacao web educativa da Casa de Saberes Cego Aderaldo. O projeto oferece um quiz sobre cultura e patrimonio cearense, registra sessoes de jogo e apresenta rankings por escola.

## Arquitetura

```text
Navegador
   |
   v
Nginx (frontend React/Vite)
   | /api
   v
API Express
   |
   v
SQLite + Prisma
```

- `frontend/`: interface React, testes Vitest e fluxo E2E com Playwright.
- `backend/`: API Express, Prisma, banco SQLite e testes nativos do Node.js.
- `scripts/`: automacoes do monorepo e atualizacao dos catalogos publicos.
- `docs/`: arquitetura, operacao, deploy, API, backup e releases.

## Requisitos

- Node.js `22.23.2` (consulte `.nvmrc`)
- npm 10 ou superior
- Docker com Compose, para executar o ambiente de producao local

## Instalacao

```bash
npm ci
npm ci --prefix backend
npm ci --prefix frontend
```

Copie os arquivos de exemplo e ajuste somente os valores necessarios:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Prepare o banco e inicie os dois servicos:

```bash
npm run prisma:generate
npm run prisma:deploy
npm run dev:all
```

Frontend: `http://localhost:5173`. API: `http://localhost:3001`.

## Variaveis de ambiente

| Variavel                     | Servico            | Finalidade                                        |
| ---------------------------- | ------------------ | ------------------------------------------------- |
| `DATABASE_URL`               | backend            | URL do SQLite, normalmente `file:./prisma/dev.db` |
| `PORT`                       | backend            | Porta HTTP da API; padrao `3001`                  |
| `CORS_ORIGINS`               | backend            | Origens autorizadas, separadas por virgula        |
| `WRITE_RATE_LIMIT_MAX`       | backend            | Limite de operacoes de escrita por janela         |
| `WRITE_RATE_LIMIT_WINDOW_MS` | backend            | Duracao da janela de limitacao em milissegundos   |
| `TRUST_PROXY`                | backend            | Quantidade de proxies confiaveis antes da API     |
| `VITE_API_URL`               | frontend           | URL da API; use `/api` em producao                |
| `BACKEND_URL`                | frontend container | Destino interno do proxy Nginx                    |

Nunca envie arquivos `.env`, bancos, backups ou credenciais ao Git.

## Comandos principais

| Comando                                                | Funcao                                            |
| ------------------------------------------------------ | ------------------------------------------------- |
| `npm run dev:all`                                      | Executa frontend e backend em desenvolvimento     |
| `npm run quality`                                      | Formata, analisa, testa com cobertura e compila   |
| `npm run audit:all`                                    | Audita dependencias de producao e desenvolvimento |
| `npm run test:all`                                     | Executa todos os testes unitarios e de integracao |
| `npm --prefix frontend run test:e2e`                   | Executa o fluxo critico no navegador              |
| `npm run backup:database`                              | Cria backup consistente do SQLite                 |
| `npm run restore:database -- --from CAMINHO --confirm` | Restaura um backup validado                       |

## Producao local

```bash
docker compose up --build
```

A aplicacao fica disponivel em `http://localhost:8080`; o Nginx entrega o frontend e encaminha `/api` ao backend. A prontidao da API e verificada em `/ready`.

## Qualidade e seguranca

O CI executa formatacao, lint, validacao do schema, testes com cobertura, build, auditoria de dependencias, CodeQL, teste E2E e build dos containers. A API inclui cabecalhos seguros, identificador de requisicao, logs estruturados e limitacao de escritas.

Consulte tambem:

- [Arquitetura](docs/ARCHITECTURE.md)
- [API](docs/API.md)
- [Deploy](docs/DEPLOYMENT.md)
- [Backup e restauracao](docs/BACKUP_RESTORE.md)
- [Runbook operacional](docs/RUNBOOK.md)
- [Releases](docs/RELEASES.md)
- [Contribuicao](CONTRIBUTING.md)
- [Seguranca](SECURITY.md)
- [Suporte](SUPPORT.md)

## Licenca

Distribuido sob a licenca MIT. Consulte [LICENSE](LICENSE).
