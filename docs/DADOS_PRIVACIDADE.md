# Dados, privacidade e retenção

Este documento descreve os dados tratados pelo quiz e as responsabilidades operacionais. Ele não substitui uma avaliação jurídica da instituição.

## Dados armazenados

O SQLite pode conter:

- nome, cidade, UF, código IBGE e código INEP opcional da escola;
- nomes de cursos associados à escola;
- etapa, série e identificação da turma;
- pontuação, categoria, ano e horário da partida;
- versões das perguntas e histórico de publicação;
- identificadores técnicos, como UUID e chave de idempotência.

## Dados que não devem ser coletados

O fluxo não exige nome, documento, e-mail, telefone ou data de nascimento de estudantes. Funcionários não devem inserir dados pessoais nos campos de escola, curso ou turma.

Use identificações coletivas, como `Turma A`, e não listas ou nomes de participantes.

## Logs

Os logs registram eventos técnicos, rota, status, duração e `X-Request-ID`. Não devem registrar:

- senha administrativa;
- cabeçalho `Authorization`;
- conteúdo integral de requisições;
- banco de perguntas privado;
- dados pessoais inseridos por engano.

## Acesso

- A aplicação é restrita à rede interna dos funcionários.
- A Administração exige senha exclusiva.
- Somente pessoas responsáveis por conteúdo e operação devem acessar backups e exportações.
- As portas do quiz não devem ser encaminhadas no roteador.

## Retenção

- Rankings são reiniciados anualmente somente depois de exportação e backup.
- A reinicialização remove partidas e participações do ano, mas preserva escolas, cursos e perguntas.
- Backups locais seguem `BACKUP_RETENTION_DAYS`, com padrão de 30 dias.
- Cópias externas devem seguir a política institucional e ser eliminadas de forma controlada quando expirarem.
- Versões antigas de perguntas podem ser descartadas manualmente, exceto a versão ativa.

## Exportações e backups

Arquivos XLSX e bancos SQLite devem ser tratados como documentos internos. Não envie por contas pessoais, links públicos ou mensageiros sem autorização. Prefira mídia externa criptografada ou armazenamento institucional com controle de acesso.

## Incidentes

Se uma senha, banco ou backup for exposto:

1. restrinja imediatamente o acesso;
2. troque a senha administrativa e demais segredos relacionados;
3. preserve evidências e horários;
4. verifique logs e cópias existentes;
5. informe o responsável institucional;
6. registre causa, impacto e ação preventiva sem republicar o dado exposto.

Vulnerabilidades de software devem seguir a [política de segurança](../.github/SECURITY.md).
