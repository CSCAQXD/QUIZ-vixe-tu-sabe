import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import BackButton from "../../src/components/common/BackButton/BackButton";
import Modal from "../../src/components/common/Modal/Modal";

describe("navegação e modal", () => {
    it("abre, fecha e desmonta o modal", async () => {
        const onClose = vi.fn();
        const { rerender } = render(<Modal isOpen onClose={onClose} title="Ajuda">Conteúdo</Modal>);
        fireEvent.keyDown(document, { key: "Escape" });
        await userEvent.click(screen.getByRole("button", { name: "Fechar" }));
        expect(onClose).toHaveBeenCalledTimes(2);
        rerender(<Modal isOpen={false} onClose={onClose} title="Ajuda" />);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("usa navegação de retorno", async () => {
        render(<MemoryRouter><BackButton /></MemoryRouter>);
        await userEvent.click(screen.getByRole("button", { name: "Voltar" }));
        expect(screen.getByRole("button", { name: "Voltar" })).toBeInTheDocument();
    });
});
