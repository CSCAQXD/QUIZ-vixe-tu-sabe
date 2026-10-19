import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import PageStatus from "../../src/components/common/PageStatus/PageStatus";
import LoadingState from "../../src/components/common/LoadingState/LoadingState";

describe("carregamento compartilhado", () => {
    it("mostra mensagem contextual com um único anúncio de estado", () => {
        const { container } = render(<PageStatus message="Carregando ranking..." />);
        const estado = screen.getByRole("status");
        expect(estado).toHaveAttribute("aria-busy", "true");
        expect(estado).toHaveAttribute("aria-live", "polite");
        expect(estado).toHaveTextContent("Carregando ranking...");
        expect(container.querySelectorAll("[aria-live]")).toHaveLength(1);
        expect(container.querySelector(".loading-state--full-screen")).not.toBeInTheDocument();
        expect(container.querySelector(".scenic-backdrop__fence")).not.toBeInTheDocument();
    });

    it("reutiliza o cenário sem expor elementos decorativos no carregamento de tela", () => {
        const { container } = render(<PageStatus fullScreen message="Carregando perguntas..." />);
        expect(screen.getByRole("status")).toHaveTextContent("Carregando perguntas...");
        expect(container.querySelector(".loading-state--full-screen")).toBeInTheDocument();
        expect(container.querySelector(".scenic-backdrop__fence")).toHaveAttribute("src", "/assets/illustrations/cerca.svg");
        expect(container.querySelector(".scenic-backdrop__ground")).toHaveAttribute("src", "/assets/illustrations/muro-tijolos.svg");
        expect(screen.queryByRole("img")).not.toBeInTheDocument();
        expect(screen.getAllByRole("status")).toHaveLength(1);
    });

    it("tem mensagem padrão e mantém ações opcionais acessíveis", async () => {
        const acao = vi.fn();
        const user = userEvent.setup();
        render(<LoadingState action={<button onClick={acao}>Cancelar</button>} />);
        expect(screen.getByRole("status")).toHaveTextContent("Carregando...");
        await user.click(screen.getByRole("button", { name: "Cancelar" }));
        expect(acao).toHaveBeenCalledOnce();
    });

    it("preserva mensagens de erro e sua ação sem sinalizar carregamento", async () => {
        const tentar = vi.fn();
        const user = userEvent.setup();
        const { container } = render(<PageStatus action={<button onClick={tentar}>Tentar novamente</button>} message="Não foi possível carregar." type="error" />);
        expect(container.querySelector(".page-status--error")).toHaveTextContent("Não foi possível carregar.");
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
        expect(container.querySelector("[aria-busy]")).not.toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
        expect(tentar).toHaveBeenCalledOnce();
    });
});
