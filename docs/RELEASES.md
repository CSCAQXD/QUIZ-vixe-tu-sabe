# Releases

O projeto usa [Semantic Versioning](https://semver.org/) e tags `vMAJOR.MINOR.PATCH`.

- `PATCH`: correcao compativel.
- `MINOR`: funcionalidade compativel.
- `MAJOR`: mudanca incompativel de contrato ou operacao.

## Processo

1. Confirme CI, CodeQL, E2E, auditorias e containers verdes.
2. Atualize a secao `Unreleased` do `CHANGELOG.md` e mova os itens para a nova versao.
3. Alinhe as versoes dos pacotes quando a aplicacao for publicada como um conjunto.
4. Crie e envie a tag, por exemplo `git tag -s v1.1.0` e `git push origin v1.1.0`.
5. O workflow publica imagens imutaveis no GHCR com SBOM e proveniencia e cria o GitHub Release.
6. Valide o deploy e registre a versao implantada.

Uma publicacao manual pelo workflow e permitida para recuperacao, mas deve usar uma referencia auditavel e nao substitui a tag oficial.
