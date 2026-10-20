-- Consolida aliases explícitos do catálogo de cursos técnicos compartilhado com a tela.
DROP INDEX IF EXISTS "Curso_escolaId_nomeBusca_key";
DROP INDEX IF EXISTS "Participacao_partidaId_etapaEnsino_serie_cursoBusca_turmaBusca_key";

UPDATE "Curso" SET "nomeBusca" = 'ciberseguranca'
WHERE "nomeBusca" IN (
    'ciberseguranca',
    'seguranca informacao',
    'ciberseguranca seguranca informacao'
);

UPDATE "Curso" SET "nomeBusca" = 'internet coisa'
WHERE "nomeBusca" IN ('iot', 'internet coisa', 'internet coisa iot');

UPDATE "Curso" SET "nomeBusca" = 'cloud computing'
WHERE "nomeBusca" IN (
    'cloud computing',
    'computacao nuvem',
    'cloud computing computacao nuvem'
);

UPDATE "Curso" SET "nomeBusca" = 'podologia infantil'
WHERE "nomeBusca" IN (
    'podologia infantil',
    'podologia pediatrica',
    'podologia infantil pediatrica'
);

UPDATE "Curso" SET "nomeBusca" = 'traducao interpretacao libra'
WHERE "nomeBusca" IN ('libra', 'traducao interpretacao libra');

UPDATE "Curso" SET "nomeBusca" = 'recurso humano'
WHERE "nomeBusca" IN ('rh', 'recurso humano');

UPDATE "Curso" SET "nomeBusca" = 'seguranca trabalho'
WHERE "nomeBusca" IN ('st', 'seguranca trabalho');

UPDATE "Curso" SET "nomeBusca" = 'administracao'
WHERE "nomeBusca" IN ('adm', 'administracao');

UPDATE "Curso" SET "nomeBusca" = 'desenvolvimento sistema'
WHERE "nomeBusca" IN ('ds', 'desenvolvimento sistema');

CREATE TEMP TABLE "_CursoCatalogoPrincipal" AS
SELECT "escolaId", "nomeBusca", MIN("id") AS "id"
FROM "Curso"
GROUP BY "escolaId", "nomeBusca";

UPDATE "Participacao"
SET "cursoId" = (
    SELECT "principal"."id"
    FROM "Curso" AS "atual"
    INNER JOIN "_CursoCatalogoPrincipal" AS "principal"
        ON "principal"."escolaId" = "atual"."escolaId"
        AND "principal"."nomeBusca" = "atual"."nomeBusca"
    WHERE "atual"."id" = "Participacao"."cursoId"
)
WHERE "cursoId" IS NOT NULL;

DELETE FROM "Curso"
WHERE "id" NOT IN (SELECT "id" FROM "_CursoCatalogoPrincipal");
DROP TABLE "_CursoCatalogoPrincipal";

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
