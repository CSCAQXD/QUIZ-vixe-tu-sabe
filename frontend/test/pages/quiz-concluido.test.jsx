import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import QuizConcluidoPage from "../../src/pages/QuizConcluido/QuizConcluidoPage";
import { listarRankingEscolas, listarRankingTurmas } from "../../src/api/rankingApi";
import { getResult } from "../../src/utils/storage";

vi.mock("../../src/api/rankingApi", () => ({
    listarRankingEscolas: vi.fn(), listarRankingTurmas: vi.fn(),
}));
vi.mock("../../src/utils/storage", () => ({ getResult: vi.fn() }));
const result = {
    partida: { pontuacaoFinal: 200, ano: 2026 },
    escola: { id: "a", nome: "Escola A" },
    turmas: [{ id: "a1", serie: 3, etapaEnsino: "MEDIO", turma: "A",
        posicaoRankingInterno: 1, totalTurmasNoRankingInterno: 3 }],
};

beforeEach(() => {
    vi.clearAllMocks();
    getResult.mockReturnValue(result);
    listarRankingEscolas.mockImplementation(() => new Promise(() => {}));
    listarRankingTurmas.mockImplementation(() => new Promise(() => {}));
});

function renderPage() {
    render(<MemoryRouter initialEntries={["/quiz-concluido"]}><Routes>
        <Route path="/quiz-concluido" element={<QuizConcluidoPage />} />
        <Route path="/" element={<h1>Início</h1>} />
        <Route path="/rankings" element={<h1>Todos os rankings</h1>} />
    </Routes></MemoryRouter>);
}

it("preserva o placar enquanto busca as posições", () => {
    renderPage();
    expect(screen.getByText("200")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Atualizando posições");
    expect(listarRankingTurmas).toHaveBeenCalledWith({ ano: 2026 });
});

it("preserva o placar e comunica a falha de atualização", async () => {
    listarRankingTurmas.mockRejectedValue(new Error("Falha técnica"));
    renderPage();
    expect(await screen.findByText(/Sua pontuação está salva/)).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
    expect(screen.queryByText("Falha técnica")).not.toBeInTheDocument();
    expect(screen.getAllByLabelText("Sem posição no ranking")).toHaveLength(2);
    expect(screen.getByLabelText("1 posição no ranking")).toBeInTheDocument();
});

it("retorna ao início quando não há resultado salvo", async () => {
    getResult.mockReturnValue(null);
    renderPage();
    expect(await screen.findByRole("heading", { name: "Início" })).toBeInTheDocument();
    expect(listarRankingTurmas).not.toHaveBeenCalled();
});
