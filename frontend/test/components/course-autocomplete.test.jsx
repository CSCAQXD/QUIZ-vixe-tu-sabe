import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { expect, it, vi } from "vitest";

import CursoAutocomplete from "../../src/components/features/turmas/CursoAutocomplete/CursoAutocomplete";

function CourseHarness({ onBlur = vi.fn() }) {
    const [value, setValue] = useState("");
    return (
        <CursoAutocomplete
            id="curso-teste"
            onBlur={onBlur}
            onChange={setValue}
            value={value}
        />
    );
}

it("filtra o catálogo e seleciona um alias sem abrir uma lista gigante", async () => {
    render(<CourseHarness />);
    const input = screen.getByRole("combobox", { name: "Curso" });

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.getByText("Digite para buscar ou cadastrar um curso."))
        .toBeInTheDocument();

    await userEvent.type(input, "nuvem");

    const option = screen.getByRole("option", { name: /^Cloud Computing/ });
    expect(screen.getAllByRole("option").length).toBeLessThanOrEqual(8);
    await userEvent.click(option);

    expect(input).toHaveValue("Cloud Computing");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
});

it("permite escrever um curso novo quando não há sugestão", async () => {
    render(<CourseHarness />);
    const input = screen.getByRole("combobox", { name: "Curso" });

    await userEvent.type(input, "Tecnologia Subaquática");

    expect(screen.getByText(/Nenhum curso semelhante no catálogo/))
        .toBeInTheDocument();
    expect(input).toHaveValue("Tecnologia Subaquática");
});

it("permite escolher pelo teclado", async () => {
    render(<CourseHarness />);
    const input = screen.getByRole("combobox", { name: "Curso" });

    await userEvent.type(input, "redes de comp");
    await userEvent.keyboard("{ArrowDown}{Enter}");

    expect(input).toHaveValue("Redes de Computadores");
});

it("oferece cada alias como opção e preserva o nome escolhido pela escola", async () => {
    render(<CourseHarness />);
    const input = screen.getByRole("combobox", { name: "Curso" });

    await userEvent.type(input, "segurança da informação");

    const alias = screen.getByRole("option", { name: /^Segurança da Informação/ });
    expect(screen.getByRole("option", { name: /^Cibersegurança/ }))
        .toBeInTheDocument();

    await userEvent.click(alias);
    expect(input).toHaveValue("Segurança da Informação");
});
