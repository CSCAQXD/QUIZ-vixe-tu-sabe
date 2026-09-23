import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "../../../src/api/apiClient";
import { listarEscolas } from "../../../src/api/escolaApi";
import { listarPerguntas } from "../../../src/api/perguntaApi";
import { listarRankingEscolas, listarRankingInterno, listarRankingTurmas } from "../../../src/api/rankingApi";
import { registrarSessao } from "../../../src/api/sessaoApi";

vi.mock("../../../src/api/apiClient", () => ({ apiRequest: vi.fn() }));

describe("endpoints do frontend", () => {
    beforeEach(() => vi.clearAllMocks());

    it("lista escolas e perguntas com fallback vazio", async () => {
        apiRequest.mockResolvedValueOnce({ escolas: [{ id: 1 }] }).mockResolvedValueOnce({});
        await expect(listarEscolas()).resolves.toEqual([{ id: 1 }]);
        await expect(listarPerguntas()).resolves.toEqual([]);
    });

    it("monta URLs e parâmetros dos rankings", async () => {
        apiRequest.mockResolvedValue({ ranking: [] });
        await listarRankingTurmas({ ano: 2026, limit: "" });
        await listarRankingEscolas({ ano: 2026 });
        await listarRankingInterno("id/escola", { limit: 10 });
        expect(apiRequest).toHaveBeenNthCalledWith(1, "/ranking-turmas?ano=2026");
        expect(apiRequest).toHaveBeenNthCalledWith(2, "/ranking-escolas?ano=2026");
        expect(apiRequest).toHaveBeenNthCalledWith(3, "/ranking-interno/id%2Fescola?limit=10");
    });

    it("registra uma sessão como JSON", async () => {
        apiRequest.mockResolvedValue({ ok: true });
        await registrarSessao({ pontos: 10 });
        expect(apiRequest).toHaveBeenCalledWith("/sessao", {
            method: "POST",
            body: JSON.stringify({ pontos: 10 }),
        });
    });
});
