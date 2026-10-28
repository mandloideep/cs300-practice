import { useState } from "react";
import ProductList from "./ProductList.jsx";
<<<<<<< HEAD
import SearchBox from "./SearchBox.jsx";
import products from "./products.js";

export default function App() {
  const [query, setQuery] = useState("");
  const shown = products.filter((product) =>
    product.title.toLowerCase().includes(query.toLowerCase()),
  );
=======
import CartSummary from "./CartSummary.jsx";
import products from "./products.js";

export default function App() {
  const [cart, setCart] = useState([]);
>>>>>>> cart-summary

  return (
    <main>
      <h1>Campus Shop</h1>
<<<<<<< HEAD
      <SearchBox query={query} onChange={setQuery} />
      <ProductList products={shown} />
=======
      <CartSummary items={cart} />
      <ProductList products={products} onAdd={(product) => setCart([...cart, product])} />
>>>>>>> cart-summary
    </main>
  );
}
