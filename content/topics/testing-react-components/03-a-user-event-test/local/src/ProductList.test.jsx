import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { expect, test } from "vitest";
import ProductList from "./ProductList.jsx";

const items = [
  { id: 3, title: "Powder Canister", price: 14.99 },
  { id: 9, title: "Sample Fragrance" },
];

function renderList() {
  render(
    <MemoryRouter>
      <ProductList items={items} />
    </MemoryRouter>,
  );
}

test("renders one item per product", () => {
  renderList();
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
});

test("links each product to its own page", () => {
  renderList();
  expect(screen.getByRole("link", { name: "Powder Canister" })).toHaveAttribute(
    "href",
    "/products/3",
  );
});

test("shows a price, or says that it is not listed", () => {
  renderList();
  expect(screen.getByText("$14.99")).toBeInTheDocument();
  expect(screen.getByText("Price not listed")).toBeInTheDocument();
});
