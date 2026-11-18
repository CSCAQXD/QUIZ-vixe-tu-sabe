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
   |              edicao
   v                |
SQLite + Prisma <- CSV enviado pela administracao
```

- `frontend/`: interface React, testes Vitest e fluxo E2E com Playwright.
- `backend/`: API Express, Prisma, banco SQLite e testes nativos do Node.js.
- `scripts/`: automacoes do monorepo e atualizacao dos catalogos publicos.
- `docs/`: arquitetura, operacao, deploy, API, backup e releases.

## Requisitos

- Node.js `22.23.2` (consulte `.nvmrc`)
- npm 10 ou superior
- Docker com Compose, para executar o ambiente de producao local

## Instalação para desenvolvimento

```powershell
npm ci
npm ci --prefix backend
npm ci --prefix frontend
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```

Prepare o banco e inicie os dois servicos:

```powershell
npm run prisma:generate
npm run prisma:deploy
npm run dev:all
```

Frontend: `http://localhost:5173`. API: `http://localhost:3001`.

## Variaveis de ambiente

| Variavel                     | Servico            | Finalidade                                      |
| ---------------------------- | ------------------ | ----------------------------------------------- |
| `DATABASE_URL`               | backend            | URL do SQLite, normalmente `file:./dev.db`      |
| `PORT`                       | backend            | Porta HTTP da API; padrao `3001`                |
| `CORS_ORIGINS`               | backend            | Origens autorizadas, separadas por virgula      |
| `WRITE_RATE_LIMIT_MAX`       | backend            | Limite de operacoes de escrita por janela       |
| `WRITE_RATE_LIMIT_WINDOW_MS` | backend            | Duracao da janela de limitacao em milissegundos |
| `TRUST_PROXY`                | backend            | Quantidade de proxies confiaveis antes da API   |
| `QUIZ_CONTEXT_SECRET`        | backend            | Assina o contexto das mediações                 |
| `PERGUNTAS_ADMIN_TOKEN`      | backend            | Senha forte da administração                    |
| `VITE_API_URL`               | frontend           | URL da API; use `/api` em producao              |
| `BACKEND_URL`                | frontend container | Destino interno do proxy Nginx                  |
| `SERVER_BIND_ADDRESS`        | Compose            | Interface publicada pelo frontend               |
| `SERVER_PORT`                | Compose            | Porta publicada pelo frontend                   |
| `BACKUP_RETENTION_DAYS`      | backend            | Retenção dos backups locais                     |

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

## Produção local

```powershell
Copy-Item .env.example .env
docker compose up --build -d
```

A aplicacao fica disponivel em `http://localhost:8080`; o Nginx entrega o frontend e encaminha `/api` ao backend. Pelo proxy, a prontidão da API é verificada em `/api/ready`; diretamente no backend, em `/ready`.

A planilha privada e a fonte de edicao. Para atualizar o quiz, baixe-a como CSV e envie o arquivo pela Administracao. O quiz usa somente a versao ativa gravada no SQLite e continua disponivel sem internet.

## Qualidade e seguranca

O CI executa formatacao, lint, validacao do schema, testes com cobertura, build, auditoria de dependencias, CodeQL, teste E2E e build dos containers. A API inclui cabecalhos seguros, identificador de requisicao, logs estruturados e limitacao de escritas.

## Documentação

- [Índice completo](docs/README.md)
- [Guia de uso para funcionários](docs/GUIA_USO.md)
- [Administração](docs/ADMINISTRACAO.md)
- [Servidor Windows](docs/SERVIDOR_WINDOWS.md)
- [Desenvolvimento](docs/DESENVOLVIMENTO.md)
- [Arquitetura](docs/ARCHITECTURE.md)
- [API](docs/API.md)
- [Deploy](docs/DEPLOYMENT.md)
- [Backup e restauracao](docs/BACKUP_RESTORE.md)
- [Runbook operacional](docs/RUNBOOK.md)
- [Releases](docs/RELEASES.md)
- [Dados e privacidade](docs/DADOS_PRIVACIDADE.md)
- [Acessibilidade](docs/ACESSIBILIDADE.md)
- [Contribuicao](.github/CONTRIBUTING.md)
- [Seguranca](.github/SECURITY.md)
- [Suporte](.github/SUPPORT.md)

## Licenca

Distribuido sob a licenca MIT. Consulte [LICENSE](LICENSE).
