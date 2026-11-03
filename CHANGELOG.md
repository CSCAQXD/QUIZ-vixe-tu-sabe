# Changelog

Mudancas relevantes deste projeto sao registradas aqui. O formato segue [Keep a Changelog](https://keepachangelog.com/) e as versoes seguem [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Sincronizacao validada da planilha para versoes persistidas no SQLite.
- Tela administrativa para revisar, publicar e restaurar versoes das perguntas.
- Documentacao de arquitetura, API, deploy, backup, operacao e releases.
- Teste E2E do fluxo principal do quiz.
- Logs estruturados com ID de requisicao e endpoint de prontidao.
- Backup e restauracao segura do banco SQLite.

### Changed

- Partidas passam a ler a versao ativa local e continuam disponiveis sem internet.
- Frontend de producao acessa a API pelo proxy `/api`.
- Containers e runtime usam uma versao Node.js consistente.
- Dependabot passa a agrupar verificacoes mensais.

### Security

- Cabecalhos HTTP seguros e limitacao de requisicoes de escrita.
- Pipeline reforcado com verificacao E2E e publicacao somente por release.

## [1.0.0] - 2026-10-21

### Added

- Primeira versao mantida do quiz, API, testes e containers de producao.
