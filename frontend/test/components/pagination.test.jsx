import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import Pagination from "../../src/components/common/Pagination/Pagination";

it("navega entre páginas e respeita os limites", async () => {
    const onChange = vi.fn();
    render(<Pagination onChange={onChange} page={1} totalPages={3} />);

    expect(screen.getByRole("button", { name: "Página anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Página 1" })).toHaveAttribute(
        "aria-current",
        "page"
    );
    await userEvent.click(screen.getByRole("button", { name: "Próxima página" }));
    expect(onChange).toHaveBeenCalledWith(2);
});

it("exibe páginas próximas e permite saltos diretos", async () => {
    const onChange = vi.fn();
    render(<Pagination onChange={onChange} page={4} totalPages={9} />);

    expect(
        screen.getAllByText("…", { selector: ".pagination__ellipsis" })
    ).toHaveLength(2);
    expect(screen.queryByRole("button", { name: "Página 2" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Página 9" }));
    expect(onChange).toHaveBeenCalledWith(9);
});
