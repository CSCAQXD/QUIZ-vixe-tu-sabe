import { describe, expect, it } from "vitest";
import { calculateAvailablePoints, isCorrectAnswer } from "../../../src/utils/quiz";

describe("quiz scoring", () => {
    it("calcula desconto sem permitir pontuação negativa", () => {
        expect(calculateAvailablePoints(100, 1)).toBe(75);
        expect(calculateAvailablePoints(100, 8)).toBe(0);
    });

    it("valida respostas corretas", () => {
        expect(isCorrectAnswer({ correctIndex: 2 }, 2)).toBe(true);
        expect(isCorrectAnswer({ correctIndex: -1 }, -1)).toBe(false);
        expect(isCorrectAnswer({ correctIndex: 2 }, 1)).toBe(false);
    });
});
