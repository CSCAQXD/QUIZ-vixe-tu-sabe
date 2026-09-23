import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import Button from "../../src/components/common/Button/Button";
import FormField from "../../src/components/common/FormField/FormField";
import PageStatus from "../../src/components/common/PageStatus/PageStatus";
import ScenicBackdrop from "../../src/components/common/ScenicBackdrop/ScenicBackdrop";
import SelectField from "../../src/components/common/SelectField/SelectField";
import SponsorsBar from "../../src/components/common/SponsorsBar/SponsorsBar";

describe("componentes comuns", () => {
    it("aciona o botão e respeita estado desabilitado", async () => {
        const onClick = vi.fn();
        const user = userEvent.setup();
        const { rerender } = render(<Button onClick={onClick}>Continuar</Button>);
        await user.click(screen.getByRole("button", { name: "Continuar" }));
        expect(onClick).toHaveBeenCalledOnce();
        rerender(<Button disabled onClick={onClick}>Continuar</Button>);
        await user.click(screen.getByRole("button", { name: "Continuar" }));
        expect(onClick).toHaveBeenCalledOnce();
    });

    it("renderiza estados e cenário", () => {
        render(<><PageStatus action={<button>Tentar</button>} message="Falhou" type="error" /><ScenicBackdrop fenceClassName="f" groundClassName="g" /><SponsorsBar /></>);
        expect(screen.getByText("Falhou")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Tentar" })).toBeInTheDocument();
        expect(document.querySelector(".f")).toBeInTheDocument();
        expect(screen.getAllByRole("img").length).toBeGreaterThan(2);
    });

    it("propaga valores e erros dos campos", async () => {
        const user = userEvent.setup();
        const onText = vi.fn();
        const onSelect = vi.fn();
        render(<><FormField error="Obrigatório" id="nome" label="Nome" onChange={onText} value="" /><SelectField error="Escolha" id="serie" label="Série" onChange={onSelect} options={[{ value: "9", label: "9º" }]} placeholder="Selecione" value="" /></>);
        await user.type(screen.getByLabelText("Nome"), "A");
        await user.selectOptions(screen.getByLabelText("Série"), "9");
        expect(onText).toHaveBeenLastCalledWith("A");
        expect(onSelect).toHaveBeenCalledWith("9");
        expect(screen.getByText("Obrigatório")).toBeInTheDocument();
    });

});
