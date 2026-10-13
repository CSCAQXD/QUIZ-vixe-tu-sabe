import { describe, expect, it } from "vitest";
import {
    filterRanking,
    paginateRanking,
} from "../../../src/utils/rankingView";

describe("visualização do ranking", () => {
    it("pesquisa ignorando acentos e maiúsculas", () => {
        const records = [
            { escola: "EEEP Júlio França" },
            { escola: "Escola Modelo" },
        ];

        expect(filterRanking(records, "julio")).toEqual([records[0]]);
    });

    it.each(["7", "7º", "7ª", "7°", "7.º", "7º ano"])(
        "encontra a série pelo termo %s sem confundir outros números", (search) => {
            const records = [
                { escola: "Escola A", serieFormatada: "7º ano — Ensino Fundamental" },
                { escola: "Escola B", serieFormatada: "8º ano", posicao: 17 },
                { escola: "Escola C", pontuacaoTotal: 700 },
                { escola: "Escola D", escolaId: "7", cursoId: "7", ano: 2027 },
                { escola: "Escola E", serieFormatada: "8º ano", posicao: 7,
                    pontuacaoTotal: 7, quantidadePartidas: 7 },
            ];
            expect(filterRanking(records, search)).toEqual([records[0]]);
        },
    );

    it("combina termos visíveis sem depender de acentos", () => {
        const records = [
            { escola: "EEEP Júlio França", serieFormatada: "7º ano", turma: "A" },
            { escola: "EEEP Júlio França", serieFormatada: "8º ano", turma: "B" },
        ];
        expect(filterRanking(records, "JULIO 7º")).toEqual([records[0]]);
        expect(filterRanking(records, "  ")).toBe(records);
    });

    it("pesquisa todo o ranking antes de dividir os resultados em páginas", () => {
        const records = Array.from({ length: 31 }, (_, index) => ({
            escola: index >= 15 ? "Escola Júlio França" : "Escola Modelo",
            serieFormatada: "7º ano — Ensino Fundamental",
        }));
        const matches = filterRanking(records, "JULIO 7");
        expect(matches).toHaveLength(16);
        expect(paginateRanking(matches, 1)).toEqual(records.slice(15, 30));
        expect(paginateRanking(matches, 2)).toEqual([records[30]]);
    });

    it("divide os resultados de quinze em quinze", () => {
        const records = Array.from({ length: 31 }, (_, index) => index + 1);

        expect(paginateRanking(records, 2)).toEqual(records.slice(15, 30));
        expect(paginateRanking(records, 3)).toEqual([31]);
    });
});
