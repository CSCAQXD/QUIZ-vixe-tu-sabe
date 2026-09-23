import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import RankingsPage from "../../src/pages/Rankings/RankingsPage";
import { listarEscolas } from "../../src/api/escolaApi";
import * as rankingApi from "../../src/api/rankingApi";

vi.mock("../../src/api/escolaApi", () => ({ listarEscolas: vi.fn() }));
vi.mock("../../src/api/rankingApi", () => ({
    listarRankingEscolas: vi.fn(),
    listarRankingInterno: vi.fn(),
    listarRankingTurmas: vi.fn(),
}));

const response = { ranking: [] };

describe("RankingsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        listarEscolas.mockResolvedValue([
            { id: "e1", nome: "Escola Modelo", cidade: "Quixadá" },
        ]);
        Object.values(rankingApi).forEach((request) =>
            request.mockResolvedValue(response),
        );
    });

    it("alterna entre os tipos de ranking", async () => {
        render(<MemoryRouter><RankingsPage /></MemoryRouter>);
        await screen.findByText("Ainda não há pontuações neste ranking.");

        fireEvent.click(screen.getByText("Entre as Escolas"));
        await waitFor(() => expect(rankingApi.listarRankingEscolas).toHaveBeenCalled());

        fireEvent.click(screen.getByText("Interno por escola"));
        await waitFor(() => expect(rankingApi.listarRankingInterno)
            .toHaveBeenCalledWith("e1", expect.any(Object)));
        expect(screen.getByText(/Escola Modelo/)).toBeInTheDocument();
    });
});
