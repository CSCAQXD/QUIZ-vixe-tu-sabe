PRAGMA foreign_keys=OFF;

CREATE TABLE "nova_Participacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "etapaEnsino" TEXT NOT NULL DEFAULT 'FUNDAMENTAL',
    "serie" INTEGER NOT NULL,
    "turma" TEXT NOT NULL,
    "partidaId" TEXT NOT NULL,
    CONSTRAINT "Participacao_partidaId_fkey" FOREIGN KEY ("partidaId")
        REFERENCES "Partida" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "nova_Participacao" ("id", "etapaEnsino", "serie", "turma", "partidaId")
SELECT "id", 'FUNDAMENTAL', "serie", "turma", "partidaId" FROM "Participacao";

DROP TABLE "Participacao";
ALTER TABLE "nova_Participacao" RENAME TO "Participacao";

CREATE UNIQUE INDEX "Participacao_partidaId_etapaEnsino_serie_turma_key"
ON "Participacao"("partidaId", "etapaEnsino", "serie", "turma");
CREATE INDEX "Participacao_partidaId_idx" ON "Participacao"("partidaId");
CREATE INDEX "Participacao_etapaEnsino_serie_turma_idx"
ON "Participacao"("etapaEnsino", "serie", "turma");

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
