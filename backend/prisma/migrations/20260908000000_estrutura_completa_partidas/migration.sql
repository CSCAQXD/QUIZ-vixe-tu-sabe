PRAGMA foreign_keys = OFF;

CREATE TABLE "Partida" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "idempotencyKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONCLUIDA',
    "pontuacaoFinal" INTEGER NOT NULL,
    "quantidadeAcertos" INTEGER NOT NULL DEFAULT 0,
    "totalDicasUsadas" INTEGER NOT NULL DEFAULT 0,
    "ano" INTEGER NOT NULL,
    "dataPartida" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canceladaEm" DATETIME,
    "motivoCancelamento" TEXT,
    "escolaId" TEXT NOT NULL,
    "criadaEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadaEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Partida_escolaId_fkey"
        FOREIGN KEY ("escolaId")
        REFERENCES "Escola" ("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE "Participacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serie" INTEGER NOT NULL,
    "turma" TEXT NOT NULL,
    "partidaId" TEXT NOT NULL,

    CONSTRAINT "Participacao_partidaId_fkey"
        FOREIGN KEY ("partidaId")
        REFERENCES "Partida" ("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE "Resposta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ordem" INTEGER NOT NULL,
    "perguntaExternaId" TEXT NOT NULL,
    "enunciado" TEXT NOT NULL,
    "opcoes" JSONB NOT NULL,
    "alternativaEscolhida" TEXT NOT NULL,
    "alternativaCorreta" TEXT NOT NULL,
    "acertou" BOOLEAN NOT NULL,
    "pontosBase" INTEGER NOT NULL,
    "dicasUsadas" INTEGER NOT NULL DEFAULT 0,
    "pontosObtidos" INTEGER NOT NULL DEFAULT 0,
    "partidaId" TEXT NOT NULL,

    CONSTRAINT "Resposta_partidaId_fkey"
        FOREIGN KEY ("partidaId")
        REFERENCES "Partida" ("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

INSERT INTO "Partida" (
    "id",
    "idempotencyKey",
    "status",
    "pontuacaoFinal",
    "quantidadeAcertos",
    "totalDicasUsadas",
    "ano",
    "dataPartida",
    "escolaId",
    "criadaEm",
    "atualizadaEm"
)
SELECT
    "grupoId",
    'LEGACY-' || "grupoId",
    'CONCLUIDA',
    MAX("pontuacao"),
    0,
    MAX("dicasUsadas"),
    CASE
    WHEN typeof(MIN("dataSessao")) = 'integer'
    THEN CAST(
        strftime(
            '%Y',
            MIN("dataSessao") / 1000,
            'unixepoch'
        ) AS INTEGER
    )
    ELSE CAST(
        strftime(
            '%Y',
            MIN("dataSessao")
        ) AS INTEGER
    )
END,
    MIN("dataSessao"),
    "escolaId",
    MIN("dataSessao"),
    MIN("dataSessao")
FROM "Sessao"
GROUP BY
    "grupoId",
    "escolaId";

INSERT INTO "Participacao" (
    "id",
    "serie",
    "turma",
    "partidaId"
)
SELECT
    "id",
    "serie",
    "turma",
    "grupoId"
FROM "Sessao";

DROP TABLE "Sessao";

CREATE UNIQUE INDEX "Partida_idempotencyKey_key"
    ON "Partida"("idempotencyKey");

CREATE INDEX "Partida_escolaId_idx"
    ON "Partida"("escolaId");

CREATE INDEX "Partida_ano_idx"
    ON "Partida"("ano");

CREATE INDEX "Partida_status_idx"
    ON "Partida"("status");

CREATE INDEX "Partida_escolaId_ano_status_idx"
    ON "Partida"("escolaId", "ano", "status");

CREATE INDEX "Partida_dataPartida_idx"
    ON "Partida"("dataPartida");

CREATE UNIQUE INDEX "Participacao_partidaId_serie_turma_key"
    ON "Participacao"("partidaId", "serie", "turma");

CREATE INDEX "Participacao_partidaId_idx"
    ON "Participacao"("partidaId");

CREATE INDEX "Participacao_serie_turma_idx"
    ON "Participacao"("serie", "turma");

CREATE UNIQUE INDEX "Resposta_partidaId_ordem_key"
    ON "Resposta"("partidaId", "ordem");

CREATE UNIQUE INDEX "Resposta_partidaId_perguntaExternaId_key"
    ON "Resposta"("partidaId", "perguntaExternaId");

CREATE INDEX "Resposta_partidaId_idx"
    ON "Resposta"("partidaId");

CREATE INDEX "Resposta_perguntaExternaId_idx"
    ON "Resposta"("perguntaExternaId");

CREATE INDEX "Resposta_acertou_idx"
    ON "Resposta"("acertou");

PRAGMA foreign_keys = ON;