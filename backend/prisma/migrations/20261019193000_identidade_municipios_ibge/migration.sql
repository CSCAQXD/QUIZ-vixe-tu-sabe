ALTER TABLE "Escola" ADD COLUMN "cidadeUf" TEXT;
ALTER TABLE "Escola" ADD COLUMN "municipioIbgeId" TEXT;

CREATE UNIQUE INDEX "Escola_nomeBusca_municipioIbgeId_key"
ON "Escola"("nomeBusca", "municipioIbgeId");

CREATE INDEX "Escola_municipioIbgeId_idx"
ON "Escola"("municipioIbgeId");
