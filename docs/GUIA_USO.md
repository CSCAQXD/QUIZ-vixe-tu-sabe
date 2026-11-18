# Guia de uso para funcionários

Este guia descreve o uso cotidiano do quiz na rede interna da Casa de Saberes Cego Aderaldo.

## Acessar o sistema

1. Conecte o notebook autorizado à mesma rede do servidor.
2. Abra `http://vixetusabe` no navegador.
3. Se o endereço curto não funcionar, tente `http://DESKTOP-ETEACEU` ou o endereço IPv4 informado pelo responsável técnico.
4. Não use links com `localhost` em notebooks clientes: `localhost` aponta para o próprio notebook, não para o servidor.

Se a tela inicial não abrir, consulte [Servidor Windows](SERVIDOR_WINDOWS.md#diagnóstico-rápido) ou peça ajuda ao responsável.

## Iniciar uma mediação

1. Na tela inicial, escolha a opção de iniciar o quiz.
2. Informe a cidade e selecione a escola sugerida pelo catálogo.
3. Cadastre uma ou mais turmas participantes.
4. Para cada turma, informe:
   - etapa e série;
   - ensino regular ou técnico;
   - curso, quando for técnico;
   - turma única ou divisão, como A, B ou outra identificação.
5. Revise os dados antes de iniciar.

Uma mediação pode incluir até 100 turmas na seleção inicial. Cada registro de escola enviado ao final pode conter até 20 turmas.

## Como as perguntas são escolhidas

- Fundamental I: 1º ao 5º ano do Ensino Fundamental.
- Fundamental II: 6º ao 9º ano do Ensino Fundamental.
- Ensino Médio: 1º ao 3º ano do Ensino Médio.
- Perguntas comuns podem aparecer para qualquer faixa.

Quando a mediação mistura faixas diferentes, o sistema usa a menor faixa presente. Exemplo: uma turma do 4º ano com uma turma do Ensino Médio recebe perguntas do Fundamental I e perguntas comuns.

## Responder ao quiz

1. Selecione uma alternativa.
2. Depois da resposta, o sistema mostra o resultado e a pontuação.
3. É possível voltar à pergunta anterior apenas para consulta; a resposta já dada não pode ser alterada.
4. Para abandonar a mediação e voltar à tela inicial, use a opção correspondente e confirme o descarte.
5. Após a última pergunta, aguarde a confirmação de que a sessão foi salva.

Não feche a página durante o envio do resultado. Se houver falha, use a opção de tentar novamente. O sistema usa uma chave de idempotência para não duplicar a mesma partida.

## Rankings

A tela de rankings oferece quatro visualizações:

- **Geral de Turmas**: compara todas as turmas participantes no ano.
- **Entre as Escolas**: soma a pontuação das partidas de cada escola.
- **Interno por escola**: compara somente as turmas de uma escola selecionada.
- **Por categoria**: separa Fundamental I, Fundamental II e Ensino Médio.

O seletor do ranking interno mostra somente escolas que possuem pontuação no ano atual. Cadastros antigos sem partidas não aparecem.

## O que fazer em caso de erro

- **A página não abre:** confirme a rede Wi-Fi e tente o nome do servidor ou o IPv4.
- **O quiz não carrega:** atualize a página uma vez e verifique se o servidor está ligado.
- **A sessão não salva:** não refaça imediatamente a partida; tente novamente na mesma tela para evitar registros desnecessários.
- **Escola ou curso incorreto:** não crie variações abreviadas sem necessidade. Use a sugestão do catálogo ou o nome completo.
- **Mensagem com código de requisição:** anote o `X-Request-ID`, o horário e os passos realizados.

Erros persistentes devem ser encaminhados ao responsável pelo sistema com navegador, horário, tela e passos para reprodução. Não envie senhas ou dados pessoais.
