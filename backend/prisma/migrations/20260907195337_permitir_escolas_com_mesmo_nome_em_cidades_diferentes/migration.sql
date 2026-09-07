/*
  Warnings:

  - A unique constraint covering the columns `[nome,cidade]` on the table `Escola` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Escola_nome_key";

-- CreateIndex
CREATE UNIQUE INDEX "Escola_nome_cidade_key" ON "Escola"("nome", "cidade");
