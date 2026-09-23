import { describe, expect, it } from "vitest";
import { getMediationSchools, groupClassroomsBySchool } from "../../../src/utils/mediation";

describe("mediation utils", () => {
    it("agrupa turmas da mesma escola sem diferenciar caixa e espaços", () => {
        expect(
            groupClassroomsBySchool([
                { nomeEscola: " Escola A ", etapaEnsino: "FUNDAMENTAL", serie: "3", turma: " A " },
                { nomeEscola: "escola   a", etapaEnsino: "MEDIO", serie: "3", turma: "B" },
            ]),
        ).toEqual([
            {
                nomeEscola: "Escola A",
                cidade: "Não informada",
                turmas: [
                    { etapaEnsino: "FUNDAMENTAL", serie: 3, turma: "A" },
                    { etapaEnsino: "MEDIO", serie: 3, turma: "B" },
                ],
            },
        ]);
    });

    it("lê o formato atual, o legado e ausência de mediação", () => {
        const escolas = [{ nomeEscola: "A", turmas: [] }];
        expect(getMediationSchools({ escolas })).toBe(escolas);
        expect(getMediationSchools({ nomeEscola: "A", cidade: "B", turmas: [] })).toEqual(escolas.map((item) => ({ ...item, cidade: "B" })));
        expect(getMediationSchools(null)).toEqual([]);
        expect(getMediationSchools({ escolas: [] })).toHaveLength(1);
    });
});
