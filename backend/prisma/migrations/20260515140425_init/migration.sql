-- CreateTable
CREATE TABLE "Escola" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "cidade" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Partida" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nivel" TEXT NOT NULL,
    "turno" TEXT NOT NULL,
    "serie" INTEGER NOT NULL,
    "turma" TEXT NOT NULL,
    "pontuacao" INTEGER NOT NULL DEFAULT 0,
    "dataPartida" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "escolaId" TEXT NOT NULL,
    CONSTRAINT "Partida_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "Escola" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Escola_nome_key" ON "Escola"("nome");
