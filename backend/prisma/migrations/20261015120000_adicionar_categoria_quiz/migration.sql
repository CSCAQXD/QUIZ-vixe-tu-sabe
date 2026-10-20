-- Partidas anteriores permanecem sem categoria: não há como inferir quais perguntas foram jogadas.
ALTER TABLE "Partida" ADD COLUMN "categoriaQuiz" TEXT
    CHECK ("categoriaQuiz" IN ('FUNDAMENTAL_1', 'FUNDAMENTAL_2', 'MEDIO'));

CREATE INDEX "Partida_ano_categoriaQuiz_idx" ON "Partida"("ano", "categoriaQuiz");
