# Quiz Vixe, Tu Sabe? — Backend

API do Quiz Interativo da Casa de Saberes Cego Aderaldo.

O backend é responsável por:

- fornecer as perguntas do quiz;
- cadastrar escolas automaticamente;
- registrar partidas com uma ou várias turmas;
- impedir duplicidade no envio de uma partida;
- manter o histórico das partidas;
- calcular os rankings anuais;
- retornar a posição imediata das turmas.

## Tecnologias

- Node.js
- Express
- Prisma ORM
- SQLite
- Papa Parse

## Pré-requisitos

- Node.js 22.23.2
- npm

## Instalação

Dentro da pasta `backend`, execute:

```bash
npm install
```

## Faixas das perguntas

O arquivo CSV deve possuir a coluna `faixa`. Os valores aceitos são:

- `Fundamental 1`, `Fundamental I` ou `FUNDAMENTAL_1`: 1º ao 5º ano;
- `Fundamental 2`, `Fundamental II` ou `FUNDAMENTAL_2`: 6º ao 9º ano;
- `Ensino Médio` ou `MEDIO`: 1º ao 3º ano do Ensino Médio;
- `Comum`, `Todas`, `Geral` ou célula vazia: pergunta disponível para qualquer faixa.

Quando houver turmas de faixas diferentes na mesma mediação, o quiz usa a
menor faixa presente. Por exemplo, uma mediação com uma turma do Ensino Médio
e outra do 4º ano recebe perguntas do Fundamental I, além das perguntas gerais.

A quantidade de perguntas é variável: não há limite fixo de 15 específicas
e 5 comuns. Todas as perguntas válidas da faixa escolhida e as comuns são usadas.

## Atualização das perguntas

A planilha pode continuar privada. O quiz lê a versão ativa armazenada no SQLite e não depende da internet durante as partidas.

1. Configure um `PERGUNTAS_ADMIN_TOKEN` com pelo menos 16 caracteres.
2. Baixe a planilha privada no formato CSV.
3. Abra a Administração pela tela inicial e informe a senha.
4. Selecione o CSV, use **Verificar arquivo** e revise o resumo das mudanças.
5. Use **Publicar atualização** somente depois da revisão.

Uma linha inválida rejeita a atualização inteira e preserva a versão atual. Versões anteriores permanecem no histórico e podem ser restauradas pela mesma tela. Um banco vazio precisa receber e publicar seu primeiro CSV pela Administração.

## Ranking por categoria

- `GET /ranking-categoria/FUNDAMENTAL_1?ano=2026`;
- `GET /ranking-categoria/FUNDAMENTAL_2?ano=2026`;
- `GET /ranking-categoria/MEDIO?ano=2026`.

Cada resposta contém `ano`, `categoria`, `total` e `ranking`. São classificadas
turmas de todas as escolas, com posições calculadas dentro da categoria.
A pesquisa e a paginação do frontend usam a lista completa retornada, sem `limit`.

A categoria é a das perguntas efetivamente utilizadas, não apenas a série da
turma. Em uma mediação mista, todas as escolas registram a mesma categoria menor.
Partidas antigas sem categoria não entram nesse ranking; não há backfill.

`GET /perguntas` com os parâmetros `turma=ETAPA:SERIE` retorna `categoriaQuiz` e
`contextoQuiz`, além de `total` e `perguntas`. O frontend envia esse mesmo contexto
em cada `POST /sessao` da mediação. A categoria é validada pelo backend a partir
do contexto assinado; enviar uma categoria avulsa não define a classificação.
O contexto dura quatro horas. Repetir uma chave de idempotência já registrada
devolve a partida existente sem duplicar a pontuação.

Configure `QUIZ_CONTEXT_SECRET` somente no `.env` do backend, com uma chave forte
e estável em produção. Nunca use prefixo `VITE_` nem envie a chave ao frontend.
Sem configuração, há uma chave temporária de desenvolvimento; reiniciar o
backend invalida contextos que ainda não foram registrados.

Para atualizar o banco e o cliente, execute na pasta `backend`:

```powershell
npm run prisma:generate
npm run prisma:deploy
```
