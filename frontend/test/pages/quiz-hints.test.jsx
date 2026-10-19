import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import QuizPage from "../../src/pages/Quiz/QuizPage";
import { carregarQuiz } from "../../src/api/perguntaApi";
import { saveMediation } from "../../src/utils/storage";

vi.mock("../../src/api/perguntaApi", () => ({ carregarQuiz: vi.fn() }));
vi.mock("../../src/api/sessaoApi", () => ({ registrarSessao: vi.fn() }));
const pergunta = { id: 1, pergunta: "Quem é o Cego Aderaldo?", correta: "A",
    opcoes: ["Um violeiro", "Um cientista", "Um escritor", "Um pintor"],
    pontosIniciais: 100, dicas: ["Ele toca um instrumento.", "O instrumento tem cordas."] };
const proxima = { ...pergunta, id: 2, pergunta: "Qual é o instrumento?" };
beforeEach(() => {
    vi.clearAllMocks();
    saveMediation({ nomeEscola: "Escola Teste", turmas: [{ etapaEnsino: "MEDIO", serie: 1, turma: "A" }] });
    carregarQuiz.mockResolvedValue({ perguntas: [pergunta, proxima],
        categoriaQuiz: "MEDIO", contextoQuiz: "contexto-assinado" });
});
async function iniciar() {
    render(<MemoryRouter><QuizPage /></MemoryRouter>);
    await screen.findByRole("heading", { name: pergunta.pergunta });
}
function verificarValor(valor) {
    expect(screen.getByText("VALE").closest("strong")).toHaveTextContent(`VALE${valor}PONTOS`);
}
function abrirConfirmacao() {
    fireEvent.click(screen.getByRole("button", { name: /Ver dica/i }));
    return screen.getByRole("dialog", { name: "Usar uma dica?" });
}

it.each(["cancelar", "Escape", "fechar"])("avisa o custo antes da dica e não cobra ao %s", async (acao) => {
    await iniciar();
    expect(screen.getByText("2 dicas restantes")).toBeInTheDocument();
    const dialogo = abrirConfirmacao();
    expect(dialogo).toHaveTextContent("100");
    expect(dialogo).toHaveTextContent("75");
    expect(screen.queryByText(pergunta.dicas[0])).not.toBeInTheDocument();
    if (acao === "cancelar") fireEvent.click(within(dialogo).getByRole("button", { name: "Continuar sem dica" }));
    if (acao === "Escape") fireEvent.keyDown(document, { key: "Escape" });
    if (acao === "fechar") fireEvent.click(within(dialogo).getByRole("button", { name: "Fechar", exact: true }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("2 dicas restantes")).toBeInTheDocument();
    verificarValor(100);
});

it("mostra o estado indisponível quando a pergunta não possui dicas", async () => {
    carregarQuiz.mockResolvedValue({ perguntas: [{ ...pergunta, dicas: [] }],
        categoriaQuiz: "MEDIO", contextoQuiz: "contexto-assinado" });
    await iniciar();
    expect(screen.getByText("Sem dicas restantes")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ver dica/i })).toBeDisabled();
    verificarValor(100);
});
