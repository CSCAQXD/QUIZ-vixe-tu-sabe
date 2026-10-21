# Seguranca

## Versoes suportadas

Somente a versao presente na branch principal recebe correcoes de seguranca.

## Como reportar

Nao abra uma issue publica para vulnerabilidades. Use **Security > Advisories > New draft security advisory** no GitHub e inclua impacto, passos de reproducao e uma possivel correcao, se conhecida.

## Controles do projeto

- CodeQL e auditoria de dependencias em todo pull request.
- Dependabot mensal para npm, containers e GitHub Actions.
- Containers sem privilegio, com SBOM e proveniencia na publicacao.
- Cabecalhos HTTP seguros, CORS explicito, limite de escritas e IDs de requisicao.
- Logs estruturados sem corpo de requisicao, credenciais ou dados pessoais.
- Backups com hash SHA-256 e restauracao que preserva a base anterior.

Ative no GitHub a protecao da branch principal, secret scanning, push protection e alertas privados do Dependabot. O proxy publico deve terminar HTTPS e aplicar HSTS; a aplicacao nao deve presumir HTTPS no ambiente local.

## Segredos e resposta a incidentes

Nunca envie `.env`, bancos, backups ou tokens ao repositorio. Armazene `DATABASE_URL`, origens CORS e segredos do provedor no gerenciador de segredos do ambiente. Se um segredo for exposto, revogue-o imediatamente, gere outro, procure usos indevidos e registre o incidente; remover o arquivo do commit nao torna o segredo seguro novamente.

Consulte o [runbook operacional](../docs/RUNBOOK.md) para triagem e recuperacao.
