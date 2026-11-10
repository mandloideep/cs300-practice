import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { expect, test } from "vitest";
import App from "./App.jsx";

test("shows the welcome heading on the home page", () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
  expect(screen.getByRole("heading", { name: "Welcome to the shop" })).toBeInTheDocument();
});
