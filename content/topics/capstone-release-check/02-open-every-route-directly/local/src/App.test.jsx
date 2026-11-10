import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, expect, test, vi } from "vitest";
import App from "./App.jsx";

const products = [
  { id: 3, title: "Powder Canister", category: "beauty", price: 14.99, description: "A light setting powder." },
  { id: 4, title: "Red Lipstick", category: "beauty", price: 12.99, description: "A classic red." },
];

function serve(body, status = 200) {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(body), { status })));
}

function renderAt(address) {
  render(
    <MemoryRouter initialEntries={[address]}>
      <App />
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

test("lists every product in the data file", async () => {
  serve(products);
  renderAt("/products");
  expect(await screen.findAllByRole("listitem")).toHaveLength(2);
});

test("says so when the catalog is empty", async () => {
  serve([]);
  renderAt("/products");
  expect(await screen.findByText("The catalog is empty. Check back soon.")).toBeInTheDocument();
});

test("offers Retry when the data cannot be loaded, and Retry recovers", async () => {
  serve({ message: "Server error" }, 500);
  renderAt("/products");
  expect(await screen.findByRole("alert")).toHaveTextContent("Could not load products.");
  serve(products);
  await userEvent.setup().click(screen.getByRole("button", { name: "Retry" }));
  expect(await screen.findAllByRole("listitem")).toHaveLength(2);
});
