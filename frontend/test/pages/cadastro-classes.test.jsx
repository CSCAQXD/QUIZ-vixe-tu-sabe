import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { expect, it } from "vitest";

import CadastroTurmasPage from "../../src/pages/CadastroTurmas/CadastroTurmasPage";

it("adiciona, reutiliza a escola e remove uma turma", async () => {
    render(<MemoryRouter><CadastroTurmasPage /></MemoryRouter>);
    await userEvent.type(screen.getByLabelText("Cidade"), "Quixadá");
    await userEvent.click(screen.getByRole("option", { name: "Quixadá — CE" }));
    await userEvent.type(screen.getByLabelText("Nome da escola"), "Escola Modelo");
    await userEvent.click(screen.getByRole("button", { name: "+ ADICIONAR TURMA" }));

    expect(screen.getByRole("heading", { name: "TURMA 2" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByLabelText("Cidade")[1])
        .toHaveFocus());
    await userEvent.click(screen.getByRole("button", { name: /Usar escola anterior/ }));
    expect(screen.getAllByLabelText("Nome da escola")[1]).toHaveValue("Escola Modelo");
    expect(screen.getAllByLabelText("Cidade")[1]).toHaveValue("Quixadá");

    await userEvent.click(screen.getAllByRole("button", { name: /Remover/ })[1]);
    expect(screen.queryByRole("heading", { name: "TURMA 2" }))
        .not.toBeInTheDocument();
});
