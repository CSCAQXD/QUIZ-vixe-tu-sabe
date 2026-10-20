import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import HomeScene from "../../src/components/features/home/HomeScene/HomeScene";
import QuizBoard from "../../src/components/features/quiz/QuizBoard/QuizBoard";
import TurmaForm from "../../src/components/features/turmas/TurmaForm/TurmaForm";

describe("componentes interativos", () => {
    it("aciona as ações da tela inicial", async () => {
        const onStart = vi.fn();
        const onOpenRankings = vi.fn();
        render(<HomeScene onOpenRankings={onOpenRankings} onStart={onStart} />);
        await userEvent.click(screen.getByRole("button", { name: "INICIAR" }));
        await userEvent.click(screen.getByRole("button", { name: "RANKINGS" }));
        expect(onStart).toHaveBeenCalledOnce();
        expect(onOpenRankings).toHaveBeenCalledOnce();
    });

    it("edita, reutiliza e remove uma turma", async () => {
        const onChange = vi.fn();
        const onRemove = vi.fn();
        const onReuse = vi.fn();
        const onBlur = vi.fn();
        render(<TurmaForm canReuseSchool errors={{ turma: "Obrigatório" }} index={1} onChange={onChange} onFieldBlur={onBlur} onRemove={onRemove} onUsePreviousSchool={onReuse} removable turma={{ id: "1", cidade: "Fortaleza", cidadeUf: "CE", municipioIbgeId: "2304400", codigoInep: "", nomeEscola: "Escola", etapaEnsino: "", serie: "", turma: "", tipoOrganizacao: "REGULAR", organizacaoTurma: "DIVIDIDA" }} />);
        await userEvent.type(screen.getByLabelText("Nome da escola"), " X");
        await userEvent.click(screen.getByLabelText("Série"));
        await userEvent.click(screen.getByRole("option", { name: "3º ano — Ensino Médio" }));
        await userEvent.type(screen.getByLabelText("Identificação da turma"), "A");
        await userEvent.click(screen.getByRole("button", { name: /Usar escola anterior/ }));
        await userEvent.click(screen.getByRole("button", { name: /Remover/ }));
        expect(onChange).toHaveBeenCalled();
        expect(onReuse).toHaveBeenCalledOnce();
        expect(onRemove).toHaveBeenCalledOnce();
    });

    it("exibe dica, seleção e feedback correto e incorreto", async () => {
        const props = {
            answerState: "answering", availablePoints: 75, currentHint: "Uma dica", currentQuestion: { id: "1", tema: "História & Vida", pergunta: "Pergunta?", opcoes: ["A", "B", "C", "D"], dicas: ["Uma dica"], correctIndex: 1 }, isHintOpen: false,
            onCloseHint: vi.fn(), onConfirm: vi.fn(), onNext: vi.fn(), onOpenHint: vi.fn(), onSelectAnswer: vi.fn(), score: 0, schoolName: "Teste", selectedAnswer: null,
        };
        const { rerender } = render(<QuizBoard {...props} />);
        expect(screen.getByText("História & Vida")).toBeInTheDocument();
        expect(screen.queryByText("SOBRE O POETA")).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: "Ver dicas" }));
        expect(props.onOpenHint).not.toHaveBeenCalled();
        await userEvent.click(screen.getByRole("button", { name: "Usar dica", exact: true }));
        expect(props.onOpenHint).toHaveBeenCalledOnce();
        expect(screen.getByRole("button", { name: "Confirmar resposta" })).toBeDisabled();
        rerender(<QuizBoard {...props} answerState="correct" isHintOpen selectedAnswer={1} score={75} />);
        expect(screen.getByText("RESPOSTA CORRETA")).toBeInTheDocument();
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        rerender(<QuizBoard {...props} answerState="wrong" selectedAnswer={0} />);
        expect(screen.getByText("RESPOSTA ERRADA")).toBeInTheDocument();
    });
});
