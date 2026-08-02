# Quiz Vixe, Tu Sabe? - Casa de Saberes Cego Aderaldo (Back-end)

API do Quiz Interativo desenvolvido para as mediações culturais da Casa de
Saberes Cego Aderaldo. Stack: **Node.js, Express, Prisma (ORM) e SQLite**.

Este backend fornece as perguntas do jogo (consumidas via Google Sheets) e
registra o histórico e os pontos das escolas visitantes, alimentando os três
rankings previstos no Documento de Requisitos (RN-006).

---

## 📂 Estrutura do projeto

```
backend/
├── index.js                     # ponto de entrada, monta as rotas
├── prisma/
│   └── schema.prisma             # modelo de dados (Escola, Sessao)
├── src/
│   ├── prismaClient.js           # instância única do Prisma Client
│   ├── utils/
│   │   └── sanitize.js           # limpeza de texto (trim + uppercase)
│   └── routes/
│       ├── perguntas.routes.js   # GET /perguntas
│       ├── escolas.routes.js     # GET /escolas
│       ├── sessoes.routes.js     # POST /sessao e /sessoes
│       └── ranking.routes.js     # os 3 rankings (RN-006)
├── .env.example
├── .gitignore
└── package.json
```

A separação em `routes/` existe para o dia em que o front-end começar a
integrar: cada arquivo é uma "fatia" isolada da API, fácil de testar e de
consumir separadamente (mesma lógica de `services/` do front, ver seção
"Integração com o Frontend" mais abaixo).

---

## 💻 Pré-requisitos

- Node.js 18.18+ (para o modo `--watch`)
- npm
- Um cliente de API tipo Thunder Client (VS Code), Postman ou Insomnia

---

## ⚙️ Configuração inicial

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev --name inicial
npx prisma generate
```

> Se você já tinha um `dev.db` antigo (schema anterior sem `grupoId`), apague
> o arquivo `dev.db` e a pasta `prisma/migrations` antes de rodar o
> `migrate dev`, para começar limpo com o schema atualizado.

## 🚀 Rodando

```bash
npm run dev
```

Deve aparecer: `🚀 Servidor da Casa de Saberes rodando em http://localhost:3001`

---

## 🧪 Contrato da API

### `GET /health`
Verifica se a API está no ar.

### `GET /perguntas`
Busca as perguntas na planilha do Google Sheets e devolve formatadas.

### `GET /escolas`
Lista todas as escolas já cadastradas (nome, cidade, id). Útil para
autocomplete no formulário de registro da turma no front.

### `POST /sessao` — uma turma
```json
{
  "nomeEscola": "EEEP Ambrosio",
  "cidade": "Quixadá",
  "serie": 9,
  "turma": "B",
  "pontuacaoOriginal": 100,
  "dicasUsadas": 0
}
```

### `POST /sessoes` — duas ou mais turmas jogando a MESMA partida (RN-007)
```json
{
  "nomeEscola": "EEEP Ambrosio",
  "cidade": "Quixadá",
  "turmas": [
    { "serie": 9, "turma": "A" },
    { "serie": 9, "turma": "B" }
  ],
  "pontuacaoOriginal": 180,
  "dicasUsadas": 0
}
```

Resposta (201) de ambas as rotas:
```json
{
  "mensagem": "Sessão(ões) registrada(s) com sucesso!",
  "escola": { "id": "...", "nome": "EEEP AMBROSIO", "cidade": "QUIXADÁ" },
  "grupoId": "...",
  "turmas": [
    {
      "serie": 9,
      "turma": "A",
      "pontuacaoDaRodada": 180,
      "pontuacaoAcumuladaNaEscola": 260,
      "posicaoRankingInterno": 1,
      "totalTurmasNoRankingInterno": 2
    }
  ]
}
```
`posicaoRankingInterno` já vem pronto na resposta — é o que alimenta a Tela
5 (Encerramento com Posição Imediata, HU-005) sem precisar de uma segunda
chamada.

> **Sobre `dicasUsadas`:** é a soma de dicas usadas em todas as perguntas da
> sessão (não um valor por pergunta). O limite de 3 dicas por pergunta
> (RN-003) é controlado pelo front-end em tempo real, já que a mediação não
> pode depender de chamadas ao servidor no meio do jogo (RNF-002).

### `GET /ranking-turmas?limit=10`
Ranking Geral de Turmas — soma os pontos de cada turma (escola+série+turma)
em todas as suas partidas.

### `GET /ranking-escolas?limit=10`
Ranking Entre Escolas — soma o total de cada escola, contando cada partida
(`grupoId`) apenas uma vez por escola, mesmo que 2+ turmas dela tenham
jogado juntas (RN-007).

### `GET /ranking-interno/:escolaId`
Ranking Interno por Escola — compara só as turmas daquela escola.

---

## 🗄️ Banco de dados

```bash
npx prisma studio   # abre em http://localhost:5555
```

## 🔗 Integração com o Frontend

Quando o desenvolvimento do front começar, cada `services/*.js` do React vai
mapear 1:1 para um arquivo de `src/routes/` daqui:

| Front (`api/services/`) | Backend (`src/routes/`) |
|---|---|
| `quizService.js` | `perguntas.routes.js` |
| `escolaService.js` | `escolas.routes.js` |
| `sessaoService.js` | `sessoes.routes.js` |
| `rankingService.js` | `ranking.routes.js` |

Isso só será organizado quando o desenvolvimento do frontend começar.
