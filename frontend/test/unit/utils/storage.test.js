import { describe, expect, it, vi } from "vitest";
import { clearQuizStorage, getMediation, getResult, saveMediation, saveResult } from "../../../src/utils/storage";

describe("quiz storage", () => {
    it("salva, recupera e limpa a sessão", () => {
        saveMediation({ escola: "A" });
        saveResult({ pontos: 100 });
        expect(getMediation()).toEqual({ escola: "A" });
        expect(getResult()).toEqual({ pontos: 100 });
        clearQuizStorage();
        expect(getMediation()).toBeNull();
        expect(getResult()).toBeNull();
    });

    it("retorna nulo para JSON inválido ou falha do storage", () => {
        sessionStorage.setItem("vixe-tu-sabe:mediacao", "{");
        sessionStorage.setItem("vixe-tu-sabe:resultado", "{");
        expect(getMediation()).toBeNull();
        expect(getResult()).toBeNull();

        vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
            throw new Error("storage indisponível");
        });
        expect(getMediation()).toBeNull();
        expect(getResult()).toBeNull();
    });
});
