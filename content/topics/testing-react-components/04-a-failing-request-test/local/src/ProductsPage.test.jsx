import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, expect, test, vi } from "vitest";
import ProductsPage from "./ProductsPage.jsx";

const products = [
  { id: 3, title: "Powder Canister", price: 14.99 },
  { id: 4, title: "Red Lipstick", price: 12.99 },
  { id: 5, title: "Red Nail Polish", price: 8.99 },
  { id: 8, title: "Dior J'adore", price: 89.99 },
];

function serve(body, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify(body), { status })),
  );
}

function renderAt(address) {
  render(
    <MemoryRouter initialEntries={[address]}>
      <ProductsPage />
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

test("shows the loading message, then the products", async () => {
  serve(products);
  renderAt("/products");
  expect(screen.getByRole("status")).toHaveTextContent("Loading products...");
  expect(await screen.findAllByRole("listitem")).toHaveLength(4);
});

test("filters the list as the shopper types", async () => {
  serve(products);
  const user = userEvent.setup();
  renderAt("/products");
  await screen.findAllByRole("listitem");
  await user.type(screen.getByRole("searchbox", { name: "Search" }), "red");
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
});

test("says so when nothing matches the search", async () => {
  serve(products);
  const user = userEvent.setup();
  renderAt("/products");
  await screen.findAllByRole("listitem");
  await user.type(screen.getByRole("searchbox", { name: "Search" }), "zzz");
  expect(screen.getByRole("status")).toHaveTextContent("No products match zzz.");
});
