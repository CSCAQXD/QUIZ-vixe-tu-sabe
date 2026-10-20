import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import QuizPage from "../../src/pages/Quiz/QuizPage";
import { carregarQuiz } from "../../src/api/perguntaApi";
import { saveMediation } from "../../src/utils/storage";

vi.mock("../../src/api/perguntaApi", () => ({ carregarQuiz: vi.fn() }));
vi.mock("../../src/api/sessaoApi", () => ({ registrarSessao: vi.fn() }));
const pergunta = { id: 1, tema: "História & Vida", pergunta: "Quem é o Cego Aderaldo?", correta: "A",
    opcoes: ["Um violeiro", "Um cientista", "Um escritor", "Um pintor"],
    pontosIniciais: 100, dicas: ["Ele toca um instrumento.", "O instrumento tem cordas."] };
const proxima = { ...pergunta, id: 2, tema: "Obra", pergunta: "Qual é o instrumento?" };
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
    expect(screen.getByText("História & Vida")).toBeInTheDocument();
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

it("consome uma dica por confirmação, informa o saldo e bloqueia após a última", async () => {
    await iniciar();
    abrirConfirmacao();
    fireEvent.click(screen.getByRole("button", { name: "Usar dica", exact: true }));
    let dialogo = screen.getByRole("dialog", { name: "Uma pista para você" });
    expect(within(dialogo).getByText(pergunta.dicas[0])).toBeInTheDocument();
    expect(screen.getByText("1 dica restante")).toBeInTheDocument();
    verificarValor(75);
    fireEvent.click(within(dialogo).getByRole("button", { name: "Fechar", exact: true }));
    expect(screen.getByText("1 dica restante")).toBeInTheDocument();
    const historico = screen.getByText("Dicas usadas").closest("details");
    expect(historico).not.toHaveAttribute("open");
    fireEvent.click(screen.getByText("Dicas usadas"));
    expect(historico).toHaveAttribute("open");
    expect(within(historico).getByText(pergunta.dicas[0])).toBeVisible();
    expect(within(historico).queryByText(pergunta.dicas[1])).not.toBeInTheDocument();
    dialogo = abrirConfirmacao();
    expect(dialogo).toHaveTextContent("75");
    expect(dialogo).toHaveTextContent("50");
    fireEvent.click(within(dialogo).getByRole("button", { name: "Usar dica", exact: true }));
    dialogo = screen.getByRole("dialog", { name: "Uma pista para você" });
    expect(within(dialogo).getByText(pergunta.dicas[1])).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    pergunta.dicas.forEach((dica) => expect(within(historico).getByText(dica)).toBeVisible());
    expect(screen.getByText("Sem dicas restantes")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ver dica/i })).toBeDisabled();
    verificarValor(50);
    fireEvent.click(screen.getByRole("button", { name: /Um violeiro/ }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar resposta" }));
    expect(screen.getByText("PONTUAÇÃO: 50")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Próxima pergunta" }));
    expect(screen.getByRole("heading", { name: proxima.pergunta })).toBeInTheDocument();
    expect(screen.getByText("Obra")).toBeInTheDocument();
    expect(screen.queryByText("História & Vida")).not.toBeInTheDocument();
    expect(screen.queryByText("Dicas usadas")).not.toBeInTheDocument();
    pergunta.dicas.forEach((dica) => expect(screen.queryByText(dica)).not.toBeInTheDocument());
    expect(screen.getByText("2 dicas restantes")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ver dica/i })).toBeEnabled();
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
