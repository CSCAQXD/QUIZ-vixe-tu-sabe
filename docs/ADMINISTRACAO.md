# Guia de administração

A área administrativa permite manter o banco de perguntas e realizar o fechamento anual dos rankings. Ela é restrita à equipe autorizada.

## Acesso

1. Abra a tela inicial do quiz.
2. Selecione **Administração**.
3. Informe a senha administrativa.

A senha deve ter entre 16 e 128 caracteres. O ícone de olho alterna a visibilidade. Uma senha incorreta ou falha de comunicação aparece em um pop-up e não deve revelar detalhes internos.

Nunca compartilhe a senha em mensagens, issues, commits ou capturas de tela. Para trocá-la, siga [Trocar a senha administrativa](SERVIDOR_WINDOWS.md#trocar-a-senha-administrativa).

## Formato do arquivo de perguntas

A planilha editorial pode continuar privada. Para atualizar o quiz, baixe a página desejada como CSV e envie o arquivo pela Administração.

O CSV deve ter até 2 MB e conter uma pergunta por linha. Os campos esperados são:

| Campo                          | Obrigatório | Descrição                                            |
| ------------------------------ | ----------- | ---------------------------------------------------- |
| `id`                           | Recomendado | Identificador único e estável da pergunta            |
| `faixa`                        | Não         | Fundamental I, Fundamental II, Ensino Médio ou comum |
| `tema`                         | Sim         | Tema exibido no quiz                                 |
| `pergunta`                     | Sim         | Texto da pergunta                                    |
| `altA`, `altB`, `altC`, `altD` | Sim         | Alternativas                                         |
| `correta`                      | Sim         | Letra `A`, `B`, `C` ou `D`                           |
| `pontosIniciais`               | Sim         | Pontuação inteira da pergunta                        |
| `dica1`, `dica2`, `dica3`      | Não         | Dicas opcionais                                      |

Os nomes dos cabeçalhos diferenciam maiúsculas de minúsculas e devem ser mantidos exatamente como na tabela. Não altere IDs de perguntas existentes apenas para corrigir texto: mantenha o ID e edite o conteúdo, para que a revisão identifique a alteração. Se `id` estiver vazio, o sistema gera um identificador pela posição, mas o uso de IDs explícitos e estáveis é recomendado.

Valores de `faixa` aceitos:

- `Fundamental 1`, `Fundamental I` ou `FUNDAMENTAL_1`;
- `Fundamental 2`, `Fundamental II` ou `FUNDAMENTAL_2`;
- `Ensino Médio` ou `MEDIO`;
- `Comum`, `Todas`, `Geral` ou célula vazia para todas as faixas.

## Publicar novas perguntas

1. Faça uma cópia de segurança da planilha editorial.
2. Baixe a página como CSV.
3. Na Administração, escolha o arquivo.
4. Selecione **Verificar arquivo**.
5. Revise as perguntas adicionadas, alteradas e removidas.
6. Publique somente se o resumo corresponder ao que foi planejado.
7. Teste uma mediação de cada faixa afetada.

A verificação cria um rascunho e nunca altera automaticamente a versão ativa. Qualquer linha inválida rejeita o arquivo inteiro. A versão ativa continua funcionando durante a correção.

## Histórico de versões

O histórico mostra as versões mantidas no SQLite.

- **Visualizar** abre uma página com as perguntas daquela versão.
- Os filtros permitem buscar por ID, enunciado, alternativa, tema e faixa.
- **Restaurar/Publicar** torna a versão escolhida ativa.
- **Descartar** exclui definitivamente uma versão inativa e exige nova confirmação da senha.

A versão ativa não pode ser descartada. Restaurar perguntas não apaga partidas, rankings ou outras versões.

## Exportar rankings

Use **Exportar rankings de ANO** antes do fechamento anual ou sempre que precisar de uma cópia para análise.

O arquivo XLSX contém seis abas fixas:

1. `Turmas`;
2. `Escolas`;
3. `Fundamental I`;
4. `Fundamental II`;
5. `Ensino Médio`;
6. `Interno por escola`.

Na aba **Interno por escola**, todas as turmas ficam em uma única tabela. Use o filtro do cabeçalho **Escola** para selecionar uma ou várias instituições. O arquivo não cria uma aba por escola.

O XLSX pode ser aberto no Excel, LibreOffice ou importado no Google Planilhas.

## Fechamento anual

Antes de apagar dados:

1. Gere um backup consistente do banco.
2. Exporte os rankings do ano.
3. Abra o XLSX e confira todas as abas.
4. Guarde o backup e a planilha em local seguro.
5. Selecione **Reiniciar rankings de ANO**.
6. Informe novamente a senha administrativa.
7. Digite exatamente `APAGAR DADOS DE ANO`.
8. Confirme e aguarde o pop-up de sucesso.

A reinicialização remove apenas partidas e participações do ano escolhido. Perguntas, versões, escolas e cursos permanecem salvos. A ação não pode ser desfeita sem restaurar um backup.

## Primeiro uso e funcionamento sem internet

Um banco novo não contém perguntas. No primeiro uso:

1. conecte temporariamente o servidor à internet ou leve o CSV até ele por meio seguro;
2. publique a primeira versão;
3. confirme que a versão ativa possui perguntas;
4. faça uma partida de teste;
5. crie um backup.

Depois disso, o quiz usa o SQLite local e continua funcionando sem acesso à planilha ou à internet.
