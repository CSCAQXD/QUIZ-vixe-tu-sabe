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

    it("divide os resultados de quinze em quinze", () => {
        const records = Array.from({ length: 31 }, (_, index) => index + 1);

        expect(paginateRanking(records, 2)).toEqual(records.slice(15, 30));
        expect(paginateRanking(records, 3)).toEqual([31]);
    });
});
