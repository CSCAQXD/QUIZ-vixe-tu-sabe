import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import RankingsPage from "../../src/pages/Rankings/RankingsPage";
import { listarRankingTurmas } from "../../src/api/rankingApi";

vi.mock("../../src/api/escolaApi", () => ({
    listarEscolas: vi.fn().mockResolvedValue([]),
}));
vi.mock("../../src/api/rankingApi", () => ({
    listarRankingTurmas: vi.fn(), listarRankingEscolas: vi.fn(),
    listarRankingInterno: vi.fn(),
    listarRankingCategoria: vi.fn(),
}));

it("pesquisa todo o ranking e volta à primeira página após alterar a busca", async () => {
    const ranking = Array.from({ length: 31 }, (_, index) => ({
        escolaId: `e${index}`, escola: index === 30 ? "Alvo distante" : `Escola ${index}`,
        etapaEnsino: "MEDIO", serie: 3, turma: "A", pontuacaoTotal: 100,
    }));
    listarRankingTurmas.mockResolvedValue({ ranking });
    render(<MemoryRouter><RankingsPage /></MemoryRouter>);
    await screen.findByRole("cell", { name: "Escola 0" });
    expect(screen.queryByRole("cell", { name: "Alvo distante" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Página 2" }));
    expect(screen.getByRole("cell", { name: "Escola 15" })).toBeInTheDocument();

    const search = screen.getByRole("searchbox", { name: "Pesquisar no ranking" });
    fireEvent.change(search, { target: { value: "Alvo distante" } });
    expect(screen.getByRole("cell", { name: "Alvo distante" })).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Paginação do ranking" }))
        .not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: "" } });
    expect(screen.getByRole("button", { name: "Página 1" }))
        .toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("cell", { name: "Escola 0" })).toBeInTheDocument();
});
