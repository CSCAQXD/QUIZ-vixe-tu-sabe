# Quiz Vixe, Tu Sabe? - Casa de Saberes Cego Aderaldo (Back-end)

Este é o repositório do Back-end (API) do Quiz Vixe, Tu Sabe? desenvolvido para as mediações culturais da Casa de Saberes Cego Aderaldo. O sistema está sendo construído utilizando **Node.js, Express, Prisma (ORM) e SQLite**.

O foco desta API é fornecer as perguntas do jogo (consumidas via Google Sheets) e registrar com segurança o histórico e os pontos das escolas que visitam o equipamento cultural, permitindo a geração de um Ranking dinâmico e gamificado.

---

## 💻 Pré-requisitos

Para rodar este projeto pela primeira vez no seu computador, você precisará ter instalado:
- [Node.js](https://nodejs.org/) (Versão 18.11 ou superior, para suporte ao modo `--watch`).
- Um gerenciador de pacotes como o **npm** (já vem com o Node.js).
- Uma extensão de testes de API no seu editor, como o **Thunder Client** (VS Code), **Postman** ou **Insomnia** (para testar sem o front-end).

---

## ⚙️ Configuração Inicial (Primeira Execução)

Siga os passos abaixo para preparar o ambiente na sua máquina:

1. **Abra o terminal** e navegue até a pasta do backend:
   ```bash
   cd backend
   ```

2. **Instale as dependências** do projeto:
    ```bash
    npm install
    ```

3. **Configure as Variáveis de Ambiente**:

    Certifique-se de que existe um arquivo chamado `.env` na raiz da pasta `backend`. Ele deve conter o caminho para o banco de dados local:
    ```env
    DATABASE_URL="file:./dev.db"
    ```


4. **Prepare o Banco de Dados (Prisma)**:

    Sincronize o schema com o banco SQLite e gere o Prisma Client executando os seguintes comandos:
    ```bash
    npx prisma db push
    npx prisma generate
    ```


---

## 🚀 Como Rodar a Aplicação

Para iniciar o servidor de desenvolvimento (que reinicia automaticamente a cada alteração no código), execute:

```bash
npm run dev
```

Se tudo estiver correto, você verá no terminal a mensagem: `Servidor rodando em http://localhost:3001`.

---

## 🧪 Como Testar o Sistema (Sem Front-end)

Como a interface do usuário (React) ainda está em desenvolvimento, toda a interação com o sistema deve ser simulada disparando requisições (Requests) diretas para a API.

Abra o **Thunder Client** (ou Postman) e teste as seguintes rotas:

### 1. Buscar Perguntas da Planilha

Esta rota acessa a planilha mestre do Google Sheets e devolve as perguntas formatadas.

* **Método:** `GET`
* **URL:** `http://localhost:3001/perguntas`
* **Body:** Não precisa.

### 2. Registrar uma Sessão de Jogo

Esta rota recebe o desempenho de uma turma, verifica se a escola já existe (se não, cria automaticamente) e salva o histórico da partida.

* **Método:** `POST`
* **URL:** `http://localhost:3001/sessao`
* **Body (JSON):**
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



### 3. Visualizar o Ranking Geral de Turmas

Esta rota consulta o banco de dados, agrupa todas as visitas da mesma turma e soma os pontos acumulados.

* **Método:** `GET`
* **URL:** `http://localhost:3001/ranking-turmas`
* **Body:** Não precisa.
---

## 🗄️ Como Visualizar o Banco de Dados

Você não precisa instalar programas pesados para ver os dados salvos. O Prisma possui uma interface visual embutida.

Com o servidor rodando em um terminal, abra **um novo terminal** na pasta `backend` e digite:

```bash
npx prisma studio
```

Isso abrirá uma aba no seu navegador (geralmente em `http://localhost:5555`) onde você poderá ver as tabelas de **Escola** e **Sessao**, além de poder adicionar, editar ou apagar registros manualmente se necessário.