# Documentação do Vixe, Tu Sabe?

Esta pasta reúne os procedimentos de uso, administração, desenvolvimento e operação do quiz da Casa de Saberes Cego Aderaldo.

## Por onde começar

| Público                   | Documento                               | Conteúdo                                                              |
| ------------------------- | --------------------------------------- | --------------------------------------------------------------------- |
| Funcionários              | [Guia de uso](GUIA_USO.md)              | Iniciar uma mediação, cadastrar turmas, jogar e consultar rankings    |
| Administradores           | [Administração](ADMINISTRACAO.md)       | Atualizar perguntas, revisar versões, exportar dados e encerrar o ano |
| Responsável pelo servidor | [Servidor Windows](SERVIDOR_WINDOWS.md) | Instalação, rede interna, inicialização automática e atualizações     |
| Desenvolvedores           | [Desenvolvimento](DESENVOLVIMENTO.md)   | Ambiente local, comandos, testes e dados fictícios                    |
| Equipe técnica            | [Arquitetura](ARCHITECTURE.md)          | Componentes, persistência e decisões técnicas                         |
| Integrações               | [API](API.md)                           | Rotas, autenticação, parâmetros e exemplos                            |

## Operação e manutenção

- [Deploy](DEPLOYMENT.md): checklist genérico de publicação e rollback.
- [Backup e restauração](BACKUP_RESTORE.md): cópia consistente do SQLite e recuperação.
- [Runbook operacional](RUNBOOK.md): diagnóstico de indisponibilidade e falhas comuns.
- [Releases](RELEASES.md): versionamento e publicação de versões.

## Segurança e contribuição

- [Dados e privacidade](DADOS_PRIVACIDADE.md)
- [Acessibilidade](ACESSIBILIDADE.md)
- [Política de segurança](../.github/SECURITY.md)
- [Guia de contribuição](../.github/CONTRIBUTING.md)
- [Suporte](../.github/SUPPORT.md)
- [Histórico de mudanças](../CHANGELOG.md)

## Regras importantes

1. A planilha de perguntas pode permanecer privada. O servidor usa a versão ativa gravada no SQLite.
2. Nunca publique arquivos `.env`, bancos SQLite, backups, senhas administrativas ou dados pessoais.
3. A aplicação deve ficar acessível somente pela rede interna dos funcionários; não encaminhe suas portas no roteador.
4. Faça backup antes de atualizações, migrações e reinicializações anuais.
5. A pasta local `docs/cego-aderaldo-banco/`, quando existir, contém material editorial privado e não faz parte da documentação pública do sistema.
