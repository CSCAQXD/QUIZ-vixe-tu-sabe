<!--
Obrigado por contribuir com o Quiz Vixe, Tu Sabe?!

Antes de abrir o PR:
- use um título no padrão Conventional Commits, por exemplo:
  feat(perguntas): versionar sincronização
  fix(escolas): carregar catálogo no backend
- mantenha o PR focado em uma única mudança;
- vincule a Issue correspondente com "Closes #número";
- substitua os exemplos e remova as seções que realmente não se aplicam;
- nunca inclua tokens, senhas, dados pessoais, bancos ou backups reais.

Marque com [x] somente as opções e verificações aplicáveis ao PR.
-->

## Resumo

<!-- Explique em poucas frases o problema e a solução entregue. -->

## Origem da mudança

- [ ] Issue relacionada: Closes #
- [ ] Correção ou manutenção técnica sem Issue
- [ ] Mudança não prevista

### Contexto adicional

<!-- Para Issue relacionada, o vínculo acima pode ser suficiente. Caso contrário, explique a necessidade. -->

## Tipo de mudança

- [ ] `feat`: nova funcionalidade
- [ ] `fix`: correção de defeito
- [ ] `refactor`: alteração interna sem mudança de comportamento
- [ ] `test`: criação ou manutenção de testes
- [ ] `docs`: documentação
- [ ] `build` / `ci`: dependências, build ou automação
- [ ] `chore`: manutenção
- [ ] Mudança incompatível (_breaking change_)

## Áreas afetadas

- [ ] Frontend (React / Vite)
- [ ] Backend (Node.js / Express)
- [ ] API / contrato HTTP
- [ ] Banco de dados / Prisma / migração
- [ ] Perguntas / Google Sheets / sincronização
- [ ] Escolas / cidades / cursos / catálogos
- [ ] Mediação / sessão / pontuação
- [ ] Rankings
- [ ] Autenticação / autorização
- [ ] UI / componentes visuais
- [ ] Acessibilidade
- [ ] Docker / deploy / operação
- [ ] Documentação
- [ ] Dependências / configuração / ambiente

## Contexto e motivação

### Problema anterior

<!-- Como o sistema se comportava? Quem era afetado? Inclua evidências sem expor dados sensíveis. -->

### Solução adotada

<!-- Descreva as decisões técnicas e o fluxo principal. -->

### Alternativas consideradas

<!-- Registre alternativas descartadas e o motivo. -->

## Escopo

### Incluído

-

### Fora do escopo

-

## Detalhes da implementação

<!--
Explique apenas o necessário para orientar a revisão. Quando aplicável, descreva:
- frontend: páginas, componentes, estado, serviços e navegação;
- backend: rota -> middleware -> controller -> service -> repositório -> Prisma;
- dados: modelos, índices, restrições e migração;
- integrações: contratos, timeout e tratamento de falhas;
- operação: container, volume, backup, restauração e funcionamento offline.
-->

### Fluxo alterado

```text
Pessoa mediadora
  -> Página / componente
  -> Serviço do frontend
  -> API
  -> Rota / middleware / controller / service
  -> Repositório / Prisma / SQLite ou catálogo local
```

### Arquivos ou módulos principais

| Área | Arquivo/módulo | Responsabilidade da mudança |
| ---- | -------------- | --------------------------- |
|      |                |                             |

## Contratos e dados

### API

<!-- Informe método, rota, autenticação, request, response e códigos HTTP. Use "Não se aplica" se necessário. -->

| Método e rota | Autenticação | Alteração | Compatibilidade |
| ------------- | ------------ | --------- | --------------- |
|               |              |           |                 |

<details>
<summary>Exemplo de requisição/resposta</summary>

```json
{}
```

</details>

### Banco de dados

- [ ] Não altera schema nem dados
- [ ] Altera `schema.prisma`
- [ ] Inclui migração versionada
- [ ] A migração foi testada em banco limpo
- [ ] A migração foi testada sobre dados existentes
- [ ] Há estratégia de rollback ou _forward fix_

**Impacto, compatibilidade e estratégia de implantação:**

<!-- Considere nulabilidade, valores padrão, índices, volume, backup e ordem entre backend e migração. -->

### Configuração e dependências

<!-- Liste variáveis de ambiente, pacotes, catálogos ou mudanças no .env.example. Nunca cole segredos. -->

| Item | Obrigatório? | Valor seguro/padrão | Motivo |
| ---- | ------------ | ------------------- | ------ |
|      |              |                     |        |

## Segurança e privacidade

- [ ] Nenhum segredo ou dado real foi incluído em código, logs, fixtures ou capturas
- [ ] Entradas são validadas e normalizadas antes do uso
- [ ] Autenticação e autorização foram verificadas no backend
- [ ] Respostas e erros não vazam detalhes internos ou dados pessoais
- [ ] Rate limit, expiração e idempotência foram considerados quando aplicável
- [ ] Tokens permanecem fora do frontend, do repositório e dos logs
- [ ] O princípio de menor privilégio foi respeitado
- [ ] Catálogos e planilhas não introduzem dados pessoais desnecessários

**Riscos identificados e mitigação:**

## Acessibilidade e experiência

- [ ] Não há mudança visual ou interativa
- [ ] Elementos interativos têm rótulo, papel e estado acessíveis
- [ ] Ordem e destino do foco foram verificados
- [ ] Leitor de tela anuncia erros, instruções e mudanças relevantes
- [ ] Contraste, tamanho de interação e redimensionamento foram considerados
- [ ] Fluxos de teclado foram testados
- [ ] Estados de carregamento, vazio, erro, offline e sucesso foram tratados
- [ ] A interface foi verificada em telas relevantes e em projeção

## Guia de testes

### Pré-requisitos

<!-- Informe sistema, branch, banco, variáveis e dados fictícios necessários. -->

1.
2.

### Verificação completa

```bash
npm run quality
npm run audit:all
```

- [ ] Formatação e lint aprovados
- [ ] Schema Prisma válido
- [ ] Testes e cobertura aprovados
- [ ] Build de produção aprovado
- [ ] Auditoria sem vulnerabilidades de severidade alta

### Teste automatizado — backend

```bash
npm --prefix backend test
```

- [ ] Suíte completa do backend aprovada
- [ ] Foram adicionados ou atualizados testes de rota/controller
- [ ] Foram adicionados ou atualizados testes de service/repositório
- [ ] Casos de validação, segurança e regressão foram cobertos

### Teste automatizado — frontend

```bash
npm --prefix frontend test
npm --prefix frontend run test:coverage
```

- [ ] Suíte completa do frontend aprovada
- [ ] Cobertura global continua em pelo menos 80%
- [ ] Componentes e serviços alterados possuem testes de comportamento
- [ ] Estados assíncronos, falhas de API e interações foram cobertos

### Teste E2E

```bash
npm --prefix frontend run test:e2e
```

- [ ] Fluxo crítico no navegador aprovado
- [ ] Não se aplica a esta mudança

### Teste manual / exploratório

| ID  | Cenário                    | Preparação e passos | Resultado esperado | Ambiente | Resultado |
| --- | -------------------------- | ------------------- | ------------------ | -------- | --------- |
| T01 | Fluxo principal            | 1. ...              | ...                | Web/API  | ✅/❌     |
| T02 | Entrada inválida           | 1. ...              | ...                |          | ✅/❌     |
| T03 | Falha ou indisponibilidade | 1. ...              | ...                |          | ✅/❌     |
| T04 | Limite ou autorização      | 1. ...              | ...                |          | ✅/❌     |

### Regressão executada

<!-- Liste fluxos existentes próximos da mudança que foram retestados. -->

- [ ] Cadastro da mediação e das turmas
- [ ] Carregamento e execução do quiz
- [ ] Dicas, respostas e pontuação
- [ ] Registro idempotente da sessão
- [ ] Rankings e histórico
- [ ] Operação sem conexão, quando aplicável

### Evidências

<!-- Anexe logs sanitizados, capturas ou vídeo. Para UI, prefira antes/depois. -->

| Antes         | Depois |
| ------------- | ------ |
| Não se aplica |        |

## Qualidade e revisão

- [ ] Revisei meu próprio diff
- [ ] Mantive responsabilidades separadas e evitei duplicação
- [ ] Não deixei código morto, logs de depuração ou comentários temporários
- [ ] Atualizei documentação, changelog e exemplos afetados
- [ ] Tratei erros sem ocultar falhas importantes
- [ ] Adicionei testes que falham sem a correção ou funcionalidade
- [ ] O lockfile foi atualizado somente quando necessário
- [ ] A mudança é retrocompatível ou a incompatibilidade está documentada
- [ ] Não inclui `.env`, bancos, backups ou dados pessoais

## Risco, implantação e rollback

**Nível de risco:** baixo / médio / alto

**Justificativa:**

**Ordem de implantação e verificações pós-deploy:**

1.
2.

**Sinais de problema a observar:**

- **Plano de rollback ou _forward fix_:**

## Pendências e acompanhamento

<!-- Liste débitos aceitos, tarefas futuras e Issues de acompanhamento. -->

- [ ] Nenhuma pendência conhecida
- [ ] Pendência:

## Nota para revisores

<!-- Aponte trechos sensíveis, decisões sobre as quais deseja opinião e uma ordem de revisão sugerida. -->
