ALTER TABLE "Escola" ADD COLUMN "codigoInep" TEXT;

CREATE UNIQUE INDEX "Escola_codigoInep_key"
ON "Escola"("codigoInep");
