import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import RankingsPage from "../../src/pages/Rankings/RankingsPage";
import { listarRankingCategoria } from "../../src/api/rankingApi";

vi.mock("../../src/api/escolaApi", () => ({ listarEscolas: vi.fn().mockResolvedValue([]) }));
vi.mock("../../src/api/rankingApi", () => ({
    listarRankingCategoria: vi.fn(), listarRankingTurmas: vi.fn().mockResolvedValue({ ranking: [] }),
    listarRankingEscolas: vi.fn(), listarRankingInterno: vi.fn(),
}));
const records = Array.from({ length: 31 }, (_, index) => ({
    escolaId: `e${index}`, escola: index === 30 ? "Última escola" : `Escola ${index}`,
    etapaEnsino: "FUNDAMENTAL", serie: 7, serieFormatada: "7º ano — Ensino Fundamental",
    turma: "A", pontuacaoTotal: 100,
}));
beforeEach(() => { vi.clearAllMocks(); listarRankingCategoria.mockReset(); });
async function openCategory() {
    render(<MemoryRouter><RankingsPage /></MemoryRouter>);
    await screen.findByText("Ainda não há pontuações neste ranking.");
    fireEvent.click(screen.getByRole("button", { name: "Por categoria" }));
}

it("pesquisa todas as páginas da categoria atual e reinicia a paginação ao trocar", async () => {
    listarRankingCategoria.mockResolvedValue({ ranking: records });
    await openCategory();
    await screen.findByRole("cell", { name: "Escola 0" });
    expect(listarRankingCategoria).toHaveBeenLastCalledWith("FUNDAMENTAL_1", expect.any(Object));
    fireEvent.click(screen.getByRole("button", { name: "Página 2" }));
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Última escola" } });
    expect(screen.getByRole("cell", { name: "Última escola" })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "7" } });
    expect(screen.getAllByRole("cell", { name: "7º ano — Ensino Fundamental" })).toHaveLength(15);
    fireEvent.click(screen.getByRole("button", { name: "Página 2" }));
    fireEvent.change(screen.getByLabelText("Selecione a categoria"), { target: { value: "FUNDAMENTAL_2" } });
    await screen.findByRole("cell", { name: "Escola 0" });
    expect(listarRankingCategoria).toHaveBeenLastCalledWith("FUNDAMENTAL_2", expect.any(Object));
    expect(screen.getByRole("button", { name: "Página 1" })).toHaveAttribute("aria-current", "page");
});

it("permite tentar de novo e impede que uma resposta antiga substitua a categoria atual", async () => {
    listarRankingCategoria.mockRejectedValueOnce(new Error("Tente novamente mais tarde."));
    await openCategory();
    await screen.findByText("Tente novamente mais tarde.");
    let finishOldRequest;
    listarRankingCategoria.mockImplementationOnce(() => new Promise((resolve) => { finishOldRequest = resolve; }));
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    listarRankingCategoria.mockResolvedValue({ ranking: [] });
    fireEvent.change(screen.getByLabelText("Selecione a categoria"), { target: { value: "MEDIO" } });
    await screen.findByText("Ainda não há pontuações neste ranking.");
    finishOldRequest({ ranking: records });
    await waitFor(() => expect(listarRankingCategoria).toHaveBeenLastCalledWith("MEDIO", expect.any(Object)));
    expect(screen.queryByRole("cell", { name: "Escola 0" })).not.toBeInTheDocument();
});
