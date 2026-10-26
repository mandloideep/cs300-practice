import { useState } from "react";

const products = [
  { id: 1, title: "Essence Mascara Lash Princess", category: "beauty", price: 9.99, rating: 2.56 },
  { id: 3, title: "Powder Canister", category: "beauty", price: 14.99, rating: 4.64 },
  { id: 6, title: "Calvin Klein CK One", category: "fragrances", price: 49.99, rating: 4.37 },
  { id: 8, title: "Dior J'adore", category: "fragrances", price: 89.99, rating: 3.8 },
  { id: 16, title: "Apple", category: "groceries", price: 1.99, rating: 4.19 },
  { id: 20, title: "Cooking Oil", category: "groceries", price: 4.99, rating: 4.8 }
];

export default function App() {
  const [lowestFirst, setLowestFirst] = useState(true);
  const sorted = [...products].sort((a, b) => (lowestFirst ? a.price - b.price : b.price - a.price));
  return (
    <main>
      <h1>Order sheet</h1>
      <p className="lead">Type a quantity next to any product, then change the order.</p>
      <div className="controls">
        <button type="button" onClick={() => setLowestFirst(!lowestFirst)}>
          {lowestFirst ? "Show highest price first" : "Show lowest price first"}
        </button>
      </div>
      <ul className="product-list">
        {sorted.map((product) => (
          <li>
            <span className="product-title">{product.title}</span>
            <span className="product-price">${product.price.toFixed(2)}</span>
            <input type="number" min="0" defaultValue="0" aria-label={`Quantity of ${product.title}`} />
          </li>
        ))}
      </ul>
    </main>
  );
}
