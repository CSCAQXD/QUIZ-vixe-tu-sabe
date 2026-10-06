import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { expect, it } from "vitest";
import HomeButton from "../../src/components/common/HomeButton/HomeButton";

it("leva diretamente para a tela inicial", async () => {
    render(
        <MemoryRouter initialEntries={["/rankings"]}>
            <Routes>
                <Route path="/" element={<p>Tela inicial</p>} />
                <Route path="/rankings" element={<HomeButton />} />
            </Routes>
        </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Tela inicial" }));
    expect(screen.getByText("Tela inicial")).toBeInTheDocument();
});
