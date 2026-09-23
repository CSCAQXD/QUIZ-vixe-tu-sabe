import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { expect, it, vi } from "vitest";

import CadastroTurmasPage from "../../src/pages/CadastroTurmas/CadastroTurmasPage";
import { saveMediation } from "../../src/utils/storage";

vi.mock("../../src/utils/storage", () => ({ saveMediation: vi.fn() }));

it("salva uma mediação válida e abre o quiz", async () => {
    render(
        <MemoryRouter initialEntries={["/cadastro-turmas"]}>
            <Routes>
                <Route path="/cadastro-turmas" element={<CadastroTurmasPage />} />
                <Route path="/quiz" element={<p>Quiz iniciado</p>} />
            </Routes>
        </MemoryRouter>,
    );

    await userEvent.type(screen.getByLabelText("Nome da escola"), "Escola Modelo");
    await userEvent.selectOptions(screen.getByLabelText("Série"), "FUNDAMENTAL:3");
    await userEvent.type(screen.getByLabelText("Identificação da turma"), "A");
    await userEvent.click(screen.getByRole("button", {
        name: "INICIAR QUIZ DA MEDIAÇÃO",
    }));

    expect(saveMediation).toHaveBeenCalledWith(expect.objectContaining({
        nomeEscola: "Escola Modelo",
    }));
    expect(screen.getByText("Quiz iniciado")).toBeInTheDocument();
});
