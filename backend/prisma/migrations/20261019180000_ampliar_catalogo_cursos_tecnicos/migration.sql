-- Consolida novas variações encontradas na ampliação do catálogo técnico.
-- Cada família mantém um único curso por escola e uma única participação por turma.
DROP INDEX IF EXISTS "Curso_escolaId_nomeBusca_key";
DROP INDEX IF EXISTS "Participacao_partidaId_etapaEnsino_serie_cursoBusca_turmaBusca_key";

UPDATE "Curso"
SET "nomeBusca" = 'manutencao metroferroviaria'
WHERE "nomeBusca" IN (
    'manutencao metroferroviaria',
    'manutencao sistema metroferroviario'
);

UPDATE "Curso"
SET "nomeBusca" = 'artista circo'
WHERE "nomeBusca" IN ('artista circo', 'arte circense');

UPDATE "Curso"
SET "nomeBusca" = 'agenciamento viagens'
WHERE "nomeBusca" IN ('agenciamento viagem', 'agenciamento viagens');

CREATE TEMP TABLE "_CursoCatalogoAmpliadoPrincipal" AS
SELECT "escolaId", "nomeBusca", MIN("id") AS "id"
FROM "Curso"
GROUP BY "escolaId", "nomeBusca";

UPDATE "Participacao"
SET "cursoId" = (
    SELECT "principal"."id"
    FROM "Curso" AS "atual"
    INNER JOIN "_CursoCatalogoAmpliadoPrincipal" AS "principal"
        ON "principal"."escolaId" = "atual"."escolaId"
        AND "principal"."nomeBusca" = "atual"."nomeBusca"
    WHERE "atual"."id" = "Participacao"."cursoId"
)
WHERE "cursoId" IS NOT NULL;

DELETE FROM "Curso"
WHERE "id" NOT IN (SELECT "id" FROM "_CursoCatalogoAmpliadoPrincipal");
DROP TABLE "_CursoCatalogoAmpliadoPrincipal";

UPDATE "Participacao"
SET "cursoBusca" = COALESCE(
    (SELECT "Curso"."nomeBusca" FROM "Curso" WHERE "Curso"."id" = "Participacao"."cursoId"),
    'SEM_CURSO'
);

DELETE FROM "Participacao"
WHERE "id" NOT IN (
    SELECT MIN("id")
    FROM "Participacao"
    GROUP BY "partidaId", "etapaEnsino", "serie", "cursoBusca", "turmaBusca"
);

CREATE UNIQUE INDEX "Curso_escolaId_nomeBusca_key"
ON "Curso"("escolaId", "nomeBusca");
CREATE UNIQUE INDEX "Participacao_partidaId_etapaEnsino_serie_cursoBusca_turmaBusca_key"
ON "Participacao"("partidaId", "etapaEnsino", "serie", "cursoBusca", "turmaBusca");
