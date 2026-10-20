-- Unifica as identidades usadas pela tela, pela API, pelo ranking e pelo banco.
-- Registros legados equivalentes são reconciliados antes das novas restrições.

DROP INDEX IF EXISTS "Escola_nomeBusca_cidadeBusca_key";
DROP INDEX IF EXISTS "Curso_escolaId_nomeBusca_key";

CREATE TEMP TABLE "_SubstituicaoIdentidade" (
    "ordem" INTEGER PRIMARY KEY,
    "origem" TEXT NOT NULL,
    "destino" TEXT NOT NULL
);

INSERT INTO "_SubstituicaoIdentidade" ("ordem", "origem", "destino") VALUES
    (1, 'Á', 'A'), (2, 'À', 'A'), (3, 'Â', 'A'), (4, 'Ã', 'A'), (5, 'Ä', 'A'),
    (6, 'á', 'A'), (7, 'à', 'A'), (8, 'â', 'A'), (9, 'ã', 'A'), (10, 'ä', 'A'),
    (11, 'É', 'E'), (12, 'È', 'E'), (13, 'Ê', 'E'), (14, 'Ë', 'E'),
    (15, 'é', 'E'), (16, 'è', 'E'), (17, 'ê', 'E'), (18, 'ë', 'E'),
    (19, 'Í', 'I'), (20, 'Ì', 'I'), (21, 'Î', 'I'), (22, 'Ï', 'I'),
    (23, 'í', 'I'), (24, 'ì', 'I'), (25, 'î', 'I'), (26, 'ï', 'I'),
    (27, 'Ó', 'O'), (28, 'Ò', 'O'), (29, 'Ô', 'O'), (30, 'Õ', 'O'), (31, 'Ö', 'O'),
    (32, 'ó', 'O'), (33, 'ò', 'O'), (34, 'ô', 'O'), (35, 'õ', 'O'), (36, 'ö', 'O'),
    (37, 'Ú', 'U'), (38, 'Ù', 'U'), (39, 'Û', 'U'), (40, 'Ü', 'U'),
    (41, 'ú', 'U'), (42, 'ù', 'U'), (43, 'û', 'U'), (44, 'ü', 'U'),
    (45, 'Ç', 'C'), (46, 'ç', 'C'), (47, 'Ñ', 'N'), (48, 'ñ', 'N'),
    (49, '.', ' '), (50, '-', ' '), (51, '/', ' '), (52, '_', ' '),
    (53, ',', ' '), (54, ';', ' '), (55, ':', ' '), (56, '(', ' '),
    (57, ')', ' '), (58, '´', ' '), (59, '`', ' '), (60, char(39), ' '),
    (61, '"', ' '), (62, 'º', ' '), (63, 'ª', ' ');

-- Nome escolar.
WITH RECURSIVE "Normalizacao" ("id", "passo", "valor") AS (
    SELECT "id", 0, upper(trim("nome")) FROM "Escola"
    UNION ALL
    SELECT "n"."id", "s"."ordem", replace("n"."valor", "s"."origem", "s"."destino")
    FROM "Normalizacao" AS "n"
    INNER JOIN "_SubstituicaoIdentidade" AS "s" ON "s"."ordem" = "n"."passo" + 1
)
UPDATE "Escola"
SET "nomeBusca" = (
    SELECT trim("valor") FROM "Normalizacao"
    WHERE "Normalizacao"."id" = "Escola"."id"
    ORDER BY "passo" DESC LIMIT 1
);

-- Cidade escolar.
WITH RECURSIVE "Normalizacao" ("id", "passo", "valor") AS (
    SELECT "id", 0, upper(trim("cidade")) FROM "Escola"
    UNION ALL
    SELECT "n"."id", "s"."ordem", replace("n"."valor", "s"."origem", "s"."destino")
    FROM "Normalizacao" AS "n"
    INNER JOIN "_SubstituicaoIdentidade" AS "s" ON "s"."ordem" = "n"."passo" + 1
)
UPDATE "Escola"
SET "cidadeBusca" = (
    SELECT trim("valor") FROM "Normalizacao"
    WHERE "Normalizacao"."id" = "Escola"."id"
    ORDER BY "passo" DESC LIMIT 1
);

UPDATE "Escola" SET "nomeBusca" = replace("nomeBusca", '  ', ' '), "cidadeBusca" = replace("cidadeBusca", '  ', ' ');
UPDATE "Escola" SET "nomeBusca" = replace("nomeBusca", '  ', ' '), "cidadeBusca" = replace("cidadeBusca", '  ', ' ');
UPDATE "Escola" SET "nomeBusca" = replace("nomeBusca", '  ', ' '), "cidadeBusca" = replace("cidadeBusca", '  ', ' ');

UPDATE "Escola"
SET "nomeBusca" = trim(substr("nomeBusca", length('ESCOLA ESTADUAL DE EDUCACAO PROFISSIONAL') + 1))
WHERE "nomeBusca" LIKE 'ESCOLA ESTADUAL DE EDUCACAO PROFISSIONAL %';
UPDATE "Escola"
SET "nomeBusca" = trim(substr("nomeBusca", length('E E E P') + 1))
WHERE "nomeBusca" LIKE 'E E E P %';
UPDATE "Escola"
SET "nomeBusca" = trim(substr("nomeBusca", length('EEEP') + 1))
WHERE "nomeBusca" LIKE 'EEEP %';

-- Escolas equivalentes passam a compartilhar o mesmo registro e histórico.
CREATE TEMP TABLE "_EscolaPrincipal" AS
SELECT "nomeBusca", "cidadeBusca", MIN("id") AS "id"
FROM "Escola"
GROUP BY "nomeBusca", "cidadeBusca";

UPDATE "Partida"
SET "escolaId" = (
    SELECT "principal"."id"
    FROM "Escola" AS "atual"
    INNER JOIN "_EscolaPrincipal" AS "principal"
        ON "principal"."nomeBusca" = "atual"."nomeBusca"
        AND "principal"."cidadeBusca" = "atual"."cidadeBusca"
    WHERE "atual"."id" = "Partida"."escolaId"
);

UPDATE "Curso"
SET "escolaId" = (
    SELECT "principal"."id"
    FROM "Escola" AS "atual"
    INNER JOIN "_EscolaPrincipal" AS "principal"
        ON "principal"."nomeBusca" = "atual"."nomeBusca"
        AND "principal"."cidadeBusca" = "atual"."cidadeBusca"
    WHERE "atual"."id" = "Curso"."escolaId"
);

DELETE FROM "Escola" WHERE "id" NOT IN (SELECT "id" FROM "_EscolaPrincipal");
DROP TABLE "_EscolaPrincipal";

CREATE UNIQUE INDEX "Escola_nomeBusca_cidadeBusca_key"
ON "Escola"("nomeBusca", "cidadeBusca");

-- Cursos: normaliza o nome, remove qualificadores e aplica aliases conhecidos.
WITH RECURSIVE "Normalizacao" ("id", "passo", "valor") AS (
    SELECT "id", 0, upper(trim("nome")) FROM "Curso"
    UNION ALL
    SELECT "n"."id", "s"."ordem", replace("n"."valor", "s"."origem", "s"."destino")
    FROM "Normalizacao" AS "n"
    INNER JOIN "_SubstituicaoIdentidade" AS "s" ON "s"."ordem" = "n"."passo" + 1
)
UPDATE "Curso"
SET "nomeBusca" = lower((
    SELECT trim("valor") FROM "Normalizacao"
    WHERE "Normalizacao"."id" = "Curso"."id"
    ORDER BY "passo" DESC LIMIT 1
));

UPDATE "Curso" SET "nomeBusca" = replace("nomeBusca", '  ', ' ');
UPDATE "Curso" SET "nomeBusca" = replace("nomeBusca", '  ', ' ');
UPDATE "Curso" SET "nomeBusca" = replace("nomeBusca", '  ', ' ');

UPDATE "Curso" SET "nomeBusca" = trim(substr("nomeBusca", length('ensino medio integrado em') + 1)) WHERE "nomeBusca" LIKE 'ensino medio integrado em %';
UPDATE "Curso" SET "nomeBusca" = trim(substr("nomeBusca", length('ensino medio integrado a') + 1)) WHERE "nomeBusca" LIKE 'ensino medio integrado a %';
UPDATE "Curso" SET "nomeBusca" = trim(substr("nomeBusca", length('tecnologia em') + 1)) WHERE "nomeBusca" LIKE 'tecnologia em %';

UPDATE "Curso" SET "nomeBusca" = trim(replace(' ' || "nomeBusca" || ' ', ' curso ', ' '));
UPDATE "Curso" SET "nomeBusca" = trim(replace(' ' || "nomeBusca" || ' ', ' cursos ', ' '));
UPDATE "Curso" SET "nomeBusca" = trim(replace(' ' || "nomeBusca" || ' ', ' ensino ', ' '));
UPDATE "Curso" SET "nomeBusca" = trim(replace(' ' || "nomeBusca" || ' ', ' integrado ', ' '));
UPDATE "Curso" SET "nomeBusca" = trim(replace(' ' || "nomeBusca" || ' ', ' profissional ', ' '));
UPDATE "Curso" SET "nomeBusca" = trim(replace(' ' || "nomeBusca" || ' ', ' profissionais ', ' '));
UPDATE "Curso" SET "nomeBusca" = trim(replace(' ' || "nomeBusca" || ' ', ' profissionalizante ', ' '));
UPDATE "Curso" SET "nomeBusca" = trim(replace(' ' || "nomeBusca" || ' ', ' profissionalizantes ', ' '));
UPDATE "Curso" SET "nomeBusca" = trim(replace(' ' || "nomeBusca" || ' ', ' tecnica ', ' '));
UPDATE "Curso" SET "nomeBusca" = trim(replace(' ' || "nomeBusca" || ' ', ' tecnicas ', ' '));
UPDATE "Curso" SET "nomeBusca" = trim(replace(' ' || "nomeBusca" || ' ', ' tecnico ', ' '));
UPDATE "Curso" SET "nomeBusca" = trim(replace(' ' || "nomeBusca" || ' ', ' tecnicos ', ' '));
UPDATE "Curso" SET "nomeBusca" = trim(replace(' ' || "nomeBusca" || ' ', ' a ', ' '));
UPDATE "Curso" SET "nomeBusca" = trim(replace(' ' || "nomeBusca" || ' ', ' ao ', ' '));
UPDATE "Curso" SET "nomeBusca" = trim(replace(' ' || "nomeBusca" || ' ', ' as ', ' '));
UPDATE "Curso" SET "nomeBusca" = trim(replace(' ' || "nomeBusca" || ' ', ' da ', ' '));
UPDATE "Curso" SET "nomeBusca" = trim(replace(' ' || "nomeBusca" || ' ', ' das ', ' '));
UPDATE "Curso" SET "nomeBusca" = trim(replace(' ' || "nomeBusca" || ' ', ' de ', ' '));
UPDATE "Curso" SET "nomeBusca" = trim(replace(' ' || "nomeBusca" || ' ', ' do ', ' '));
UPDATE "Curso" SET "nomeBusca" = trim(replace(' ' || "nomeBusca" || ' ', ' dos ', ' '));
UPDATE "Curso" SET "nomeBusca" = trim(replace(' ' || "nomeBusca" || ' ', ' e ', ' '));
UPDATE "Curso" SET "nomeBusca" = trim(replace(' ' || "nomeBusca" || ' ', ' em ', ' '));
UPDATE "Curso" SET "nomeBusca" = trim(replace(' ' || "nomeBusca" || ' ', ' o ', ' '));
UPDATE "Curso" SET "nomeBusca" = trim(replace(' ' || "nomeBusca" || ' ', ' os ', ' '));
UPDATE "Curso" SET "nomeBusca" = replace("nomeBusca", '  ', ' ');
UPDATE "Curso" SET "nomeBusca" = replace("nomeBusca", '  ', ' ');
UPDATE "Curso" SET "nomeBusca" = replace("nomeBusca", '  ', ' ');

UPDATE "Curso" SET "nomeBusca" = replace("nomeBusca", ' ', '')
WHERE "nomeBusca" GLOB '[a-z] [a-z]'
   OR "nomeBusca" GLOB '[a-z] [a-z] [a-z]'
   OR "nomeBusca" GLOB '[a-z] [a-z] [a-z] [a-z]'
   OR "nomeBusca" GLOB '[a-z] [a-z] [a-z] [a-z] [a-z]';

-- Singularização conservadora, aplicada termo a termo a qualquer curso.
CREATE TEMP TABLE "_CursoTermo" AS
WITH RECURSIVE "Separacao" ("id", "posicao", "restante", "termo") AS (
    SELECT "id", 0, trim("nomeBusca") || ' ', '' FROM "Curso"
    UNION ALL
    SELECT
        "id",
        "posicao" + 1,
        ltrim(substr("restante", instr("restante", ' ') + 1)),
        substr("restante", 1, instr("restante", ' ') - 1)
    FROM "Separacao"
    WHERE "restante" <> ''
)
SELECT
    "id",
    "posicao",
    CASE
        WHEN length("termo") > 4 AND substr("termo", -3) IN ('oes', 'aes')
            THEN substr("termo", 1, length("termo") - 3) || 'ao'
        WHEN length("termo") > 4 AND substr("termo", -3) = 'ais'
            THEN substr("termo", 1, length("termo") - 3) || 'al'
        WHEN length("termo") > 4 AND substr("termo", -3) = 'eis'
            THEN substr("termo", 1, length("termo") - 3) || 'el'
        WHEN length("termo") > 5 AND substr("termo", -3) IN ('res', 'zes')
            THEN substr("termo", 1, length("termo") - 2)
        WHEN length("termo") > 4 AND substr("termo", -2) IN ('as', 'es', 'is', 'os', 'us')
            THEN substr("termo", 1, length("termo") - 1)
        ELSE "termo"
    END AS "termo"
FROM "Separacao"
WHERE "termo" <> '';

UPDATE "Curso"
SET "nomeBusca" = (
    SELECT group_concat("termo", ' ')
    FROM (
        SELECT "termo"
        FROM "_CursoTermo"
        WHERE "_CursoTermo"."id" = "Curso"."id"
        ORDER BY "posicao"
    )
);
DROP TABLE "_CursoTermo";

UPDATE "Curso"
SET "nomeBusca" = 'rede computador'
WHERE "nomeBusca" IN (
    'rede', 'rede computador', 'rede computacional'
);

-- Reconcilia também siglas gerais (ADS, RH, TI...) e abreviações seguras
-- de uma única palavra (ADM/Administração, EDIF/Edificações...).
CREATE TEMP TABLE "_CursoTokenComparacao" AS
WITH RECURSIVE "Separacao" ("id", "posicao", "restante", "termo") AS (
    SELECT "id", 0, trim("nomeBusca") || ' ', '' FROM "Curso"
    UNION ALL
    SELECT
        "id",
        "posicao" + 1,
        ltrim(substr("restante", instr("restante", ' ') + 1)),
        substr("restante", 1, instr("restante", ' ') - 1)
    FROM "Separacao"
    WHERE "restante" <> ''
)
SELECT "id", "posicao", "termo"
FROM "Separacao"
WHERE "termo" <> '';

CREATE TEMP TABLE "_CursoInfo" AS
SELECT
    "curso"."id",
    "curso"."escolaId",
    "curso"."nomeBusca",
    (SELECT count(*)
        FROM "_CursoTokenComparacao" AS "termo"
        WHERE "termo"."id" = "curso"."id") AS "quantidadeTermos",
    (SELECT group_concat("inicial", '')
        FROM (
            SELECT substr("termo", 1, 1) AS "inicial"
            FROM "_CursoTokenComparacao"
            WHERE "_CursoTokenComparacao"."id" = "curso"."id"
            ORDER BY "posicao"
        )) AS "sigla"
FROM "Curso" AS "curso";

CREATE TEMP TABLE "_CursoLigacao" AS
SELECT "primeiro"."id" AS "origem", "segundo"."id" AS "destino"
FROM "_CursoInfo" AS "primeiro"
INNER JOIN "_CursoInfo" AS "segundo"
    ON "segundo"."escolaId" = "primeiro"."escolaId"
WHERE
    "primeiro"."nomeBusca" = "segundo"."nomeBusca"
    OR (
        "primeiro"."quantidadeTermos" = 1
        AND "segundo"."quantidadeTermos" >= 2
        AND length("primeiro"."nomeBusca") BETWEEN 2 AND 8
        AND "primeiro"."nomeBusca" = "segundo"."sigla"
    )
    OR (
        "segundo"."quantidadeTermos" = 1
        AND "primeiro"."quantidadeTermos" >= 2
        AND length("segundo"."nomeBusca") BETWEEN 2 AND 8
        AND "segundo"."nomeBusca" = "primeiro"."sigla"
    )
    OR (
        "primeiro"."quantidadeTermos" = 1
        AND "segundo"."quantidadeTermos" = 1
        AND length("primeiro"."nomeBusca") BETWEEN 3 AND 5
        AND length("segundo"."nomeBusca") >= length("primeiro"."nomeBusca") + 3
        AND "segundo"."nomeBusca" LIKE "primeiro"."nomeBusca" || '%'
    )
    OR (
        "primeiro"."quantidadeTermos" = 1
        AND "segundo"."quantidadeTermos" = 1
        AND length("segundo"."nomeBusca") BETWEEN 3 AND 5
        AND length("primeiro"."nomeBusca") >= length("segundo"."nomeBusca") + 3
        AND "primeiro"."nomeBusca" LIKE "segundo"."nomeBusca" || '%'
    );

CREATE TEMP TABLE "_CursoPrincipal" AS
WITH RECURSIVE "Alcance" ("origem", "destino") AS (
    SELECT "id", "id" FROM "Curso"
    UNION
    SELECT "Alcance"."origem", "_CursoLigacao"."destino"
    FROM "Alcance"
    INNER JOIN "_CursoLigacao" ON "_CursoLigacao"."origem" = "Alcance"."destino"
)
SELECT "origem" AS "id", MIN("destino") AS "idPrincipal"
FROM "Alcance"
GROUP BY "origem";

UPDATE "Participacao"
SET "cursoId" = (
    SELECT "idPrincipal"
    FROM "_CursoPrincipal"
    WHERE "_CursoPrincipal"."id" = "Participacao"."cursoId"
)
WHERE "cursoId" IS NOT NULL;

DELETE FROM "Curso" WHERE "id" NOT IN (SELECT "idPrincipal" FROM "_CursoPrincipal");
DROP TABLE "_CursoPrincipal";
DROP TABLE "_CursoLigacao";
DROP TABLE "_CursoInfo";
DROP TABLE "_CursoTokenComparacao";

CREATE UNIQUE INDEX "Curso_escolaId_nomeBusca_key"
ON "Curso"("escolaId", "nomeBusca");

-- A chave antiga de participação ignorava o curso.
DROP INDEX IF EXISTS "Participacao_partidaId_etapaEnsino_serie_turma_key";
DROP INDEX IF EXISTS "Participacao_etapaEnsino_serie_turma_idx";

ALTER TABLE "Participacao" ADD COLUMN "turmaBusca" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Participacao" ADD COLUMN "cursoBusca" TEXT NOT NULL DEFAULT 'SEM_CURSO';

WITH RECURSIVE "Normalizacao" ("id", "passo", "valor") AS (
    SELECT "id", 0, upper(trim("turma")) FROM "Participacao"
    UNION ALL
    SELECT "n"."id", "s"."ordem", replace("n"."valor", "s"."origem", "s"."destino")
    FROM "Normalizacao" AS "n"
    INNER JOIN "_SubstituicaoIdentidade" AS "s" ON "s"."ordem" = "n"."passo" + 1
)
UPDATE "Participacao"
SET "turmaBusca" = (
    SELECT trim("valor") FROM "Normalizacao"
    WHERE "Normalizacao"."id" = "Participacao"."id"
    ORDER BY "passo" DESC LIMIT 1
);

UPDATE "Participacao" SET "turmaBusca" = replace("turmaBusca", '  ', ' ');
UPDATE "Participacao" SET "turmaBusca" = replace("turmaBusca", '  ', ' ');
UPDATE "Participacao" SET "turmaBusca" = replace("turmaBusca", '  ', ' ');
UPDATE "Participacao" SET "turmaBusca" = trim(substr("turmaBusca", length('TURMA') + 1)) WHERE "turmaBusca" LIKE 'TURMA %';
UPDATE "Participacao" SET "turmaBusca" = replace("turmaBusca", ' ', '');

UPDATE "Participacao"
SET "cursoBusca" = COALESCE(
    (SELECT "Curso"."nomeBusca" FROM "Curso" WHERE "Curso"."id" = "Participacao"."cursoId"),
    'SEM_CURSO'
);

-- Linhas legadas iguais sob a nova identidade não podem pontuar duas vezes.
DELETE FROM "Participacao"
WHERE "id" NOT IN (
    SELECT MIN("id")
    FROM "Participacao"
    GROUP BY "partidaId", "etapaEnsino", "serie", "cursoBusca", "turmaBusca"
);

CREATE UNIQUE INDEX "Participacao_partidaId_etapaEnsino_serie_cursoBusca_turmaBusca_key"
ON "Participacao"("partidaId", "etapaEnsino", "serie", "cursoBusca", "turmaBusca");
CREATE INDEX "Participacao_etapaEnsino_serie_cursoBusca_turmaBusca_idx"
ON "Participacao"("etapaEnsino", "serie", "cursoBusca", "turmaBusca");

DROP TABLE "_SubstituicaoIdentidade";
