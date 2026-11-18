# Acessibilidade

O quiz deve ser utilizável por teclado, com zoom do navegador e por pessoas com baixa visão. Este documento define critérios de manutenção; não declara conformidade formal com uma norma específica.

## Diretrizes do projeto

- Fonte Atkinson Hyperlegible para leitura em telas.
- Contraste suficiente entre texto, fundo, botões e estados.
- Hierarquia visual consistente com a identidade do projeto.
- Rótulos visíveis para campos de formulário.
- Foco de teclado perceptível.
- Botões com nomes acessíveis, não apenas ícones.
- Pop-ups com título, mensagem, ação principal e forma clara de fechar.
- Erros escritos em linguagem direta, sem depender somente de cor.
- Respeito ao zoom e a diferentes tamanhos de tela sem esconder ações essenciais.

## Comportamento esperado

- A tecla Tab percorre os controles em ordem lógica.
- Enter e Espaço ativam botões conforme o elemento nativo.
- O foco entra no pop-up quando ele abre e retorna ao controle de origem ao fechar.
- Campos de senha oferecem alternância de visibilidade com nome acessível.
- Alternativas e resposta correta permanecem distinguíveis sem depender exclusivamente do verde ou vermelho.
- A navegação anterior no quiz não permite alterar uma resposta já registrada.

## Checklist antes do merge

1. Navegar pelo fluxo principal usando somente teclado.
2. Testar zoom de 200% no navegador.
3. Conferir textos longos de perguntas e alternativas.
4. Abrir todos os pop-ups e verificar foco, fechamento e leitura.
5. Confirmar que mensagens de erro aparecem como pop-up quando esse é o padrão da tela.
6. Testar contraste dos estados normal, foco, desabilitado, sucesso e erro.
7. Executar os testes automatizados do frontend.
8. Testar ao menos um navegador usado pelos funcionários.

## Ao criar novos componentes

Prefira elementos HTML nativos (`button`, `input`, `select`, `label`, `table`) antes de simular controles com `div`. Use ARIA somente para complementar semântica ausente; ARIA não corrige interação quebrada.

Mudanças visuais devem preservar legibilidade e espaço útil da tela do quiz. Evite cabeçalhos, barras e controles decorativos que comprimam excessivamente a pergunta e as alternativas.
