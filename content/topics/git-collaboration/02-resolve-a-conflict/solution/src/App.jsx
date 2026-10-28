import { useState } from "react";
import ProductList from "./ProductList.jsx";
import SearchBox from "./SearchBox.jsx";
import CartSummary from "./CartSummary.jsx";
import products from "./products.js";

export default function App() {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]);
  const shown = products.filter((product) =>
    product.title.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <main>
      <h1>Campus Shop</h1>
      <SearchBox query={query} onChange={setQuery} />
      <CartSummary items={cart} />
      <ProductList products={shown} onAdd={(product) => setCart([...cart, product])} />
    </main>
  );
}
