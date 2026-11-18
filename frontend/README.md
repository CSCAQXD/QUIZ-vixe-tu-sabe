# Frontend do Vixe, Tu Sabe?

Interface React do quiz da Casa de Saberes Cego Aderaldo.

## Responsabilidades

- tela inicial e navegação;
- cadastro de escolas e turmas;
- execução do quiz e feedback das respostas;
- envio idempotente das sessões;
- rankings por turma, escola, escola selecionada e categoria;
- área administrativa de perguntas e fechamento anual;
- telas de erro acessíveis e pop-ups de confirmação.

## Tecnologias

- React 19;
- React Router;
- Vite;
- Vitest e Testing Library;
- Playwright;
- Atkinson Hyperlegible.

## Configuração

```powershell
Copy-Item .env.example .env
```

| Variável       | Uso                                                                |
| -------------- | ------------------------------------------------------------------ |
| `VITE_API_URL` | URL da API em desenvolvimento; recomendado `http://localhost:3001` |

Em produção, a imagem é compilada com `VITE_API_URL=/api`. O Nginx encaminha essas chamadas ao backend indicado por `BACKEND_URL`.

## Executar

Na pasta `frontend`:

```powershell
npm ci
npm run dev
```

Acesse `http://localhost:5173`.

## Rotas da interface

| Rota                       | Tela                        |
| -------------------------- | --------------------------- |
| `/`                        | Tela inicial                |
| `/cadastro-turmas`         | Cadastro da mediação        |
| `/quiz`                    | Perguntas                   |
| `/quiz-concluido`          | Resultado e próximos passos |
| `/rankings`                | Rankings                    |
| `/administracao/perguntas` | Administração autenticada   |

Rotas desconhecidas voltam para a tela inicial.

## Comandos

| Comando                 | Finalidade                |
| ----------------------- | ------------------------- |
| `npm run dev`           | Servidor Vite             |
| `npm run build`         | Build de produção         |
| `npm run preview`       | Pré-visualização do build |
| `npm test`              | Testes Vitest             |
| `npm run test:coverage` | Cobertura                 |
| `npm run test:e2e`      | Fluxo E2E                 |
| `npm run lint`          | ESLint                    |

## Estado local

O navegador guarda dados transitórios da mediação para permitir navegação e recuperação do fluxo. Esse armazenamento não substitui o banco. O resultado oficial é o registro aceito pelo backend.

## Produção

O `Dockerfile` gera os arquivos estáticos e usa Nginx sem privilégios. Somente o frontend é publicado no host; o backend permanece na rede interna do Compose.

Consulte [Desenvolvimento](../docs/DESENVOLVIMENTO.md), [Arquitetura](../docs/ARCHITECTURE.md) e [API](../docs/API.md).
