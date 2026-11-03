CREATE TABLE "VersaoPerguntas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "criadaEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ativadaEm" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'RASCUNHO',
    "hash" TEXT NOT NULL,
    "total" INTEGER NOT NULL
);

CREATE TABLE "PerguntaImportada" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "versaoId" TEXT NOT NULL,
    "idExterno" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "faixa" TEXT NOT NULL,
    "tema" TEXT NOT NULL,
    "enunciado" TEXT NOT NULL,
    "altA" TEXT NOT NULL,
    "altB" TEXT NOT NULL,
    "altC" TEXT NOT NULL,
    "altD" TEXT NOT NULL,
    "correta" TEXT NOT NULL,
    "pontosIniciais" INTEGER NOT NULL,
    "dica1" TEXT,
    "dica2" TEXT,
    "dica3" TEXT,
    CONSTRAINT "PerguntaImportada_versaoId_fkey"
        FOREIGN KEY ("versaoId") REFERENCES "VersaoPerguntas" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "VersaoPerguntas_hash_key" ON "VersaoPerguntas"("hash");
CREATE INDEX "VersaoPerguntas_status_idx" ON "VersaoPerguntas"("status");
CREATE INDEX "VersaoPerguntas_criadaEm_idx" ON "VersaoPerguntas"("criadaEm");
CREATE UNIQUE INDEX "PerguntaImportada_versaoId_idExterno_key"
    ON "PerguntaImportada"("versaoId", "idExterno");
CREATE INDEX "PerguntaImportada_versaoId_ordem_idx"
    ON "PerguntaImportada"("versaoId", "ordem");
