CREATE TABLE "Curso" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "nomeBusca" TEXT NOT NULL,
    "escolaId" TEXT NOT NULL,
    CONSTRAINT "Curso_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "Escola" ("id") ON DELETE CASCADE
);
ALTER TABLE "Participacao" ADD COLUMN "cursoId" TEXT REFERENCES "Curso"("id");
CREATE UNIQUE INDEX "Curso_escolaId_nomeBusca_key" ON "Curso"("escolaId", "nomeBusca");
CREATE INDEX "Curso_escolaId_idx" ON "Curso"("escolaId");
