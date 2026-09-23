import { describe, expect, it } from "vitest";
import { formatClassroom } from "../../../src/utils/classroomCatalog";

describe("catálogo de turmas", () => {
    it("formata uma turma regular única", () => {
        expect(formatClassroom({ serie: 3, turma: "UNICA" }))
            .toBe("3º ano · Turma única");
    });

    it("formata curso técnico usando o nome canônico", () => {
        expect(formatClassroom({ serie: 2, turma: "A", curso: "REDES_COMPUTADORES", tipoOrganizacao: "TECNICA" }))
            .toBe("2º ano de Redes de Computadores · Turma A");
    });
});
