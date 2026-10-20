ALTER TABLE "Escola" ADD COLUMN "nomeBusca" TEXT;
ALTER TABLE "Escola" ADD COLUMN "cidadeBusca" TEXT;
CREATE UNIQUE INDEX "Escola_nomeBusca_cidadeBusca_key"
ON "Escola"("nomeBusca", "cidadeBusca");
