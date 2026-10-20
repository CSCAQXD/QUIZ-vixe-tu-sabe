# Segurança

## Versões suportadas

Somente a versão presente na branch principal recebe correções de segurança.

## Como reportar

Não abra uma issue pública para vulnerabilidades. Use **Security > Advisories >
New draft security advisory** no repositório GitHub e inclua impacto, passos de
reprodução e uma possível correção, se conhecida.

Segredos nunca devem ser enviados ao repositório. Em produção, configure
`QUIZ_CONTEXT_SECRET`, `DATABASE_URL` e `CORS_ORIGINS` no gerenciador de segredos
do provedor de hospedagem.
