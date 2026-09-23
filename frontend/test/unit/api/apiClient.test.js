import { afterEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "../../../src/api/apiClient";

describe("apiRequest", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("envia JSON, preserva headers e retorna a resposta", async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({ ok: true }),
        });
        vi.stubGlobal("fetch", fetchMock);

        await expect(apiRequest("/teste", { headers: { Authorization: "x" } })).resolves.toEqual({ ok: true });
        expect(fetchMock).toHaveBeenCalledWith(
            "http://localhost:3001/teste",
            expect.objectContaining({ headers: { "Content-Type": "application/json", Authorization: "x" } }),
        );
    });

    it.each([
        [{ erro: "erro específico" }, "erro específico"],
        [{ mensagem: "mensagem específica" }, "mensagem específica"],
        [{}, "Não foi possível concluir a requisição."],
    ])("trata erros da API", async (body, message) => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            ok: false,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => body,
        }));
        await expect(apiRequest("/erro")).rejects.toThrow(message);
    });

    it("aceita resposta sem conteúdo JSON", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            ok: true,
            headers: new Headers({ "content-type": "text/plain" }),
        }));
        await expect(apiRequest("/vazio")).resolves.toBeNull();
    });
});
