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
- Axios
- Papa Parse

## Pré-requisitos

- Node.js 18.18 ou superior
- npm

## Instalação

Dentro da pasta `backend`, execute:

```bash
npm install
```

## Faixas das perguntas

A planilha publicada deve possuir a coluna `faixa`. Os valores aceitos são:

- `Fundamental I` ou `FUNDAMENTAL_1`: 1º ao 5º ano;
- `Fundamental II` ou `FUNDAMENTAL_2`: 6º ao 9º ano;
- `Ensino Médio` ou `MEDIO`: 1º ao 3º ano do Ensino Médio;
- `Todas`, `Geral` ou célula vazia: pergunta disponível para qualquer faixa.

Quando houver turmas de faixas diferentes na mesma mediação, o quiz usa a
menor faixa presente. Por exemplo, uma mediação com uma turma do Ensino Médio
e outra do 4º ano recebe perguntas do Fundamental I, além das perguntas gerais.
