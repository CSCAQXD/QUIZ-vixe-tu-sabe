-- CreateTable
CREATE TABLE "Escola" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "cidade" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Sessao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serie" INTEGER NOT NULL,
    "turma" TEXT NOT NULL,
    "pontuacao" INTEGER NOT NULL DEFAULT 0,
    "dicasUsadas" INTEGER NOT NULL DEFAULT 0,
    "grupoId" TEXT NOT NULL,
    "dataSessao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "escolaId" TEXT NOT NULL,
    CONSTRAINT "Sessao_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "Escola" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Escola_nome_key" ON "Escola"("nome");

-- CreateIndex
CREATE INDEX "Sessao_escolaId_idx" ON "Sessao"("escolaId");

-- CreateIndex
CREATE INDEX "Sessao_grupoId_idx" ON "Sessao"("grupoId");

-- CreateIndex
CREATE INDEX "Sessao_escolaId_serie_turma_idx" ON "Sessao"("escolaId", "serie", "turma");
