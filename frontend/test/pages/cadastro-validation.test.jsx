import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { expect, it } from "vitest";

import CadastroTurmasPage from "../../src/pages/CadastroTurmas/CadastroTurmasPage";

async function selectField(label, option, index = 0) {
    await userEvent.click(screen.getAllByLabelText(label)[index]);
    await userEvent.click(screen.getByRole("option", { name: option }));
}

it("mostra os erros dos campos obrigatórios", async () => {
    render(<MemoryRouter><CadastroTurmasPage /></MemoryRouter>);

    await userEvent.click(screen.getByRole("button", {
        name: "INICIAR QUIZ DA MEDIAÇÃO",
    }));

    expect(screen.getAllByText("Campo obrigatório.")).toHaveLength(3);
    expect(screen.getByLabelText("Cidade")).toHaveFocus();
});

it("valida o tamanho mínimo do nome da escola", async () => {
    render(<MemoryRouter><CadastroTurmasPage /></MemoryRouter>);
    await userEvent.type(screen.getByLabelText("Cidade"), "Fortaleza");
    await userEvent.click(screen.getByRole("option", { name: "Fortaleza — CE" }));
    const school = screen.getByLabelText("Nome da escola");

    await userEvent.type(school, "AB");
    await userEvent.tab();

    expect(screen.getByText("Digite pelo menos 3 letras."))
        .toBeInTheDocument();
});

it("exige curso somente no ensino técnico", async () => {
    render(<MemoryRouter><CadastroTurmasPage /></MemoryRouter>);

    await selectField("Tipo de organização", "Ensino técnico ou profissional");
    await userEvent.click(screen.getByRole("button", {
        name: "INICIAR QUIZ DA MEDIAÇÃO",
    }));

    expect(screen.getByText("Informe o curso.")).toBeInTheDocument();
});

it("explica a duplicidade de turma única no cartão e no resumo", async () => {
    render(<MemoryRouter><CadastroTurmasPage /></MemoryRouter>);

    await userEvent.type(screen.getByLabelText("Cidade"), "Fortaleza");
    await userEvent.click(screen.getByRole("option", { name: "Fortaleza — CE" }));
    await userEvent.type(screen.getByLabelText("Nome da escola"), "Escola Teste");
    await selectField("Série", "1º ano — Ensino Médio");
    await userEvent.click(screen.getByRole("button", { name: "+ ADICIONAR TURMA" }));
    await userEvent.click(screen.getByRole("button", { name: /Usar escola anterior/ }));
    await selectField("Série", "1º ano — Ensino Médio", 1);

    expect(screen.getByText(/Duplicada da turma 1/)).toBeInTheDocument();
    expect(screen.getByText(/1 duplicata/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", {
        name: "INICIAR QUIZ DA MEDIAÇÃO",
    }));

    expect(screen.getByText(/Não foi possível iniciar: há turmas repetidas/))
        .toBeInTheDocument();
    expect(screen.getAllByLabelText("Série")[1]).toHaveFocus();
});

it("trata REDES e Redes de Computadores como o mesmo curso", async () => {
    render(<MemoryRouter><CadastroTurmasPage /></MemoryRouter>);

    await userEvent.type(screen.getByLabelText("Cidade"), "Fortaleza");
    await userEvent.click(screen.getByRole("option", { name: "Fortaleza — CE" }));
    await userEvent.type(screen.getByLabelText("Nome da escola"), "Escola Técnica");
    await selectField("Tipo de organização", "Ensino técnico ou profissional");
    await userEvent.type(screen.getByLabelText("Curso"), "REDES");
    await selectField("Série", "2º ano — Ensino Médio");
    await userEvent.click(screen.getByRole("button", { name: "+ ADICIONAR TURMA" }));
    await userEvent.click(screen.getByRole("button", { name: /Usar escola anterior/ }));
    await selectField("Tipo de organização", "Ensino técnico ou profissional", 1);
    await userEvent.type(
        screen.getAllByLabelText("Curso")[1],
        "Curso Técnico em Redes de Computadores",
    );
    await selectField("Série", "2º ano — Ensino Médio", 1);

    expect(screen.getByText(/Duplicada da turma 1: escola\/cidade, curso, série e identificação/))
        .toBeInTheDocument();
});

it("permite cursos técnicos distintos na mesma série e turma", async () => {
    render(
        <MemoryRouter initialEntries={["/cadastro-turmas"]}>
            <Routes>
                <Route path="/cadastro-turmas" element={<CadastroTurmasPage />} />
                <Route path="/quiz" element={<p>Quiz iniciado</p>} />
            </Routes>
        </MemoryRouter>,
    );

    await userEvent.type(screen.getByLabelText("Cidade"), "Fortaleza");
    await userEvent.click(screen.getByRole("option", { name: "Fortaleza — CE" }));
    await userEvent.type(screen.getByLabelText("Nome da escola"), "Escola Técnica");
    await selectField("Tipo de organização", "Ensino técnico ou profissional");
    await userEvent.type(screen.getByLabelText("Curso"), "Redes");
    await selectField("Série", "2º ano — Ensino Médio");
    await userEvent.click(screen.getByRole("button", { name: "+ ADICIONAR TURMA" }));
    await userEvent.click(screen.getByRole("button", { name: /Usar escola anterior/ }));
    await selectField("Tipo de organização", "Ensino técnico ou profissional", 1);
    await userEvent.type(screen.getAllByLabelText("Curso")[1], "Enfermagem");
    await selectField("Série", "2º ano — Ensino Médio", 1);
    await userEvent.click(screen.getByRole("button", {
        name: "INICIAR QUIZ DA MEDIAÇÃO",
    }));

    expect(screen.getByText("Quiz iniciado")).toBeInTheDocument();
});

it("rejeita Única como identificação de uma turma dividida", async () => {
    render(<MemoryRouter><CadastroTurmasPage /></MemoryRouter>);

    await selectField("Organização da turma", "Turma dividida");
    await userEvent.type(screen.getByLabelText("Identificação da turma"), "Única");
    await userEvent.tab();

    expect(screen.getByText(/Use uma identificação da divisão, como A, B ou Noite/))
        .toBeInTheDocument();
});
