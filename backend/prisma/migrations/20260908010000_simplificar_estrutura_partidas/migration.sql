/*
  Warnings:

  - You are about to drop the `Resposta` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `atualizadaEm` on the `Partida` table. All the data in the column will be lost.
  - You are about to drop the column `canceladaEm` on the `Partida` table. All the data in the column will be lost.
  - You are about to drop the column `criadaEm` on the `Partida` table. All the data in the column will be lost.
  - You are about to drop the column `motivoCancelamento` on the `Partida` table. All the data in the column will be lost.
  - You are about to drop the column `quantidadeAcertos` on the `Partida` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Partida` table. All the data in the column will be lost.
  - You are about to drop the column `totalDicasUsadas` on the `Partida` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Resposta_acertou_idx";

-- DropIndex
DROP INDEX "Resposta_perguntaExternaId_idx";

-- DropIndex
DROP INDEX "Resposta_partidaId_idx";

-- DropIndex
DROP INDEX "Resposta_partidaId_perguntaExternaId_key";

-- DropIndex
DROP INDEX "Resposta_partidaId_ordem_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Resposta";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Partida" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "idempotencyKey" TEXT NOT NULL,
    "pontuacaoFinal" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "dataPartida" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "escolaId" TEXT NOT NULL,
    CONSTRAINT "Partida_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "Escola" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Partida" ("ano", "dataPartida", "escolaId", "id", "idempotencyKey", "pontuacaoFinal") SELECT "ano", "dataPartida", "escolaId", "id", "idempotencyKey", "pontuacaoFinal" FROM "Partida";
DROP TABLE "Partida";
ALTER TABLE "new_Partida" RENAME TO "Partida";
CREATE UNIQUE INDEX "Partida_idempotencyKey_key" ON "Partida"("idempotencyKey");
CREATE INDEX "Partida_escolaId_idx" ON "Partida"("escolaId");
CREATE INDEX "Partida_ano_idx" ON "Partida"("ano");
CREATE INDEX "Partida_escolaId_ano_idx" ON "Partida"("escolaId", "ano");
CREATE INDEX "Partida_dataPartida_idx" ON "Partida"("dataPartida");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Escola_nome_idx" ON "Escola"("nome");
