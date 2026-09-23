import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";

import RankingsPage from "../../src/pages/Rankings/RankingsPage";
import { listarRankingTurmas } from "../../src/api/rankingApi";

vi.mock("../../src/api/escolaApi", () => ({
    listarEscolas: vi.fn().mockRejectedValue(new Error("indisponível")),
}));
vi.mock("../../src/api/rankingApi", () => ({
    listarRankingEscolas: vi.fn(),
    listarRankingInterno: vi.fn(),
    listarRankingTurmas: vi.fn()
        .mockRejectedValueOnce(new Error("Falha no ranking"))
        .mockResolvedValue({ ranking: [] }),
}));

it("informa a falha e permite tentar novamente", async () => {
    render(<MemoryRouter><RankingsPage /></MemoryRouter>);

    expect(await screen.findByText("Falha no ranking")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Tentar novamente"));

    expect(await screen.findByText("Ainda não há pontuações neste ranking."))
        .toBeInTheDocument();
    expect(listarRankingTurmas).toHaveBeenCalledTimes(2);
});
