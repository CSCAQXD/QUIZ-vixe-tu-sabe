import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import Pagination from "../../src/components/common/Pagination/Pagination";

it("navega entre páginas e respeita os limites", async () => {
    const onChange = vi.fn();
    render(<Pagination onChange={onChange} page={1} totalPages={3} />);

    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Próxima" }));
    expect(onChange).toHaveBeenCalledWith(2);
    expect(screen.getByText(/Página/)).toHaveTextContent("Página 1 de 3");
});
