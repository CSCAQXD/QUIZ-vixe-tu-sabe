import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { expect, it } from "vitest";

import CadastroTurmasPage from "../../src/pages/CadastroTurmas/CadastroTurmasPage";

it("mostra os erros dos campos obrigatórios", async () => {
    render(<MemoryRouter><CadastroTurmasPage /></MemoryRouter>);

    await userEvent.click(screen.getByRole("button", {
        name: "INICIAR QUIZ DA MEDIAÇÃO",
    }));

    expect(screen.getAllByText("Campo obrigatório.")).toHaveLength(2);
});

it("valida o tamanho mínimo do nome da escola", async () => {
    render(<MemoryRouter><CadastroTurmasPage /></MemoryRouter>);
    const school = screen.getByLabelText("Nome da escola");

    await userEvent.type(school, "AB");
    await userEvent.tab();

    expect(screen.getByText("Digite pelo menos 3 letras."))
        .toBeInTheDocument();
});
