# Arquitetura do sistema

## Visao geral

O projeto e um monorepo com frontend React/Vite e API Express. Em producao, um Nginx sem privilegios entrega os arquivos estaticos e encaminha `/api` ao backend. O backend acessa SQLite por Prisma.

```text
Planilha privada -> CSV -> Administração -> versões no SQLite
                                              ^
notebooks -> frontend/Nginx -> /api -> Express/Prisma
                                              |
                                              v
                                      SQLite persistente
```

## Responsabilidades

- `frontend/src`: telas, componentes, estado da sessao e cliente HTTP.
- `backend/routers`: contrato HTTP e middlewares por recurso.
- `backend/controllers`: traducao entre HTTP e casos de uso.
- `backend/services`: regras de negocio e persistencia.
- `backend/prisma`: schema, migracoes e dados iniciais.
- `backend/middlewares`: erros, contexto da requisicao e protecoes transversais.
- `shared`: catálogos de municípios, escolas e cursos usados sem depender da internet.
- `scripts`: automações de desenvolvimento, catálogos e servidor Windows.

## Fluxo de uma mediação

1. O frontend coleta escola e turmas.
2. `GET /perguntas` escolhe a menor faixa participante e retorna as perguntas da versão ativa.
3. O backend assina categoria e turmas em `contextoQuiz` com `QUIZ_CONTEXT_SECRET`.
4. O navegador executa o quiz sem conhecer o segredo.
5. Ao final, `POST /sessao` valida o contexto, normaliza escola, município, cursos e turmas e grava a pontuação.
6. `idempotencyKey` impede que uma repetição da mesma requisição duplique a partida.
7. Os rankings são calculados a partir de partidas e participações do ano consultado.

## Modelo de dados

- `Escola`: identidade da instituição e do município, com código INEP opcional.
- `Curso`: nome usado pela escola e identidade normalizada para evitar aliases duplicados.
- `Partida`: pontuação, categoria, ano, data e chave de idempotência.
- `Participacao`: turma associada à partida, com etapa, série, divisão e curso opcional.
- `VersaoPerguntas`: rascunho, versão ativa ou histórica, identificada por hash.
- `PerguntaImportada`: conteúdo de cada pergunta dentro de uma versão.

Uma partida de uma escola pode possuir várias participações. A pontuação integral da partida é atribuída a cada turma participante no ranking de turmas; no ranking de escolas, a partida é contabilizada uma única vez.

## Perguntas e versões

O conteúdo editorial não fica embutido no bundle do frontend. A Administração recebe um CSV, valida todas as linhas e grava um rascunho. Somente a ativação explícita muda as perguntas servidas. O histórico permite revisar e restaurar versões anteriores.

O servidor não consulta a planilha durante o quiz. Depois da primeira importação, perguntas e rankings funcionam sem internet.

## Rede e contêineres

O Compose possui três serviços:

- `migrate`: aplica migrações e encerra;
- `backend`: API na rede interna do Compose, sem porta publicada no host;
- `frontend`: Nginx publicado no host e proxy de `/api` para o backend.

O volume nomeado `quiz-data` contém o SQLite. A pasta `backups` do host é montada em `/backups`. A pasta `shared` é somente leitura no backend.

## Decisoes importantes

- A URL padrao do navegador e relativa (`/api`), evitando publicar `localhost` no bundle.
- O SQLite atende ao volume atual e simplifica a operacao; exige volume persistente e apenas uma instancia de escrita.
- `/health` indica que o processo HTTP responde; `/ready` confirma tambem o acesso ao banco.
- Cada resposta inclui `X-Request-ID`, reaproveitado nos logs para diagnostico.
- Escritas sensiveis recebem limitacao por IP; os valores sao configuraveis por ambiente.
- A planilha pode permanecer privada. O CSV baixado e enviado manualmente pela Administracao, validado como rascunho e so passa a servir o quiz depois da confirmacao do mediador.
- O SQLite conserva uma unica versao ativa e o historico recente. Isso permite restaurar uma versao anterior e mantem o quiz operacional sem internet depois da primeira importacao.
- A primeira execucao sem versao ativa exige o envio e a publicacao de um CSV pela Administracao.
- A senha administrativa autentica a área restrita, mas não substitui a restrição de rede. A aplicação deve continuar indisponível para o público externo.
- A chave de contexto nunca recebe prefixo `VITE_` e não é entregue ao navegador.

## Disponibilidade e recuperação

- `restart: unless-stopped` reinicia frontend e backend quando o Docker Engine volta.
- No Windows com Docker Desktop, o usuário precisa entrar na sessão para iniciar o Engine.
- `/health` verifica o processo; `/ready` verifica também o SQLite.
- Backups são produzidos pela API do SQLite para evitar cópias inconsistentes durante escrita.
- A restauração preserva a base anterior antes da troca.

## Limites conhecidos

SQLite nao e adequado para varias replicas escrevendo no mesmo arquivo por armazenamento de rede. Antes de escalar horizontalmente, migre a persistencia para um banco servidor, adapte o datasource Prisma e exercite migracao e rollback.

O Docker Desktop não oferece disponibilidade antes do login do Windows. Para operação contínua sem login interativo, prefira um host Linux administrado como servidor.

Alteracoes de contrato devem atualizar [API.md](API.md), testes e consumidores no mesmo pull request.
