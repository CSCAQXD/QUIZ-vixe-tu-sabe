import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import HintControl from "../../src/components/features/quiz/HintControl/HintControl";

it("mantém o teclado no aviso e devolve o foco sem gastar a dica ao cancelar", async () => {
    const onUseHint = vi.fn();
    render(<HintControl availablePoints={100} nextHintPoints={75} remainingHints={1} onUseHint={onUseHint} />);
    const trigger = screen.getByRole("button", { name: "Ver dica" });
    await userEvent.click(trigger);
    const close = screen.getByRole("button", { name: "Fechar", exact: true });
    expect(close).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Usar dica", exact: true })).toHaveFocus();
    await userEvent.tab();
    expect(close).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
    expect(onUseHint).not.toHaveBeenCalled();
});

it("não anuncia perda de pontos quando o valor da pergunta já chegou a zero", async () => {
    render(<HintControl availablePoints={0} nextHintPoints={0} remainingHints={1} onUseHint={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Ver dica" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("sem nova redução");
});
