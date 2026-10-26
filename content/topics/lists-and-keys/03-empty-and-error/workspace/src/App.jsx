import { useState } from "react";

const products = [
  { id: 1, title: "Essence Mascara Lash Princess", category: "beauty", price: 9.99, rating: 2.56 },
  { id: 3, title: "Powder Canister", category: "beauty", price: 14.99, rating: 4.64 },
  { id: 6, title: "Calvin Klein CK One", category: "fragrances", price: 49.99, rating: 4.37 },
  { id: 8, title: "Dior J'adore", category: "fragrances", price: 89.99, rating: 3.8 },
  { id: 16, title: "Apple", category: "groceries", price: 1.99, rating: 4.19 },
  { id: 20, title: "Cooking Oil", category: "groceries", price: 4.99, rating: 4.8 }
];

function ProductList({ items }) {
  return (
    <ul className="product-list">
      {items.map((product) => (
        <li key={product.id}>
          <span className="product-title">{product.title}</span>
          <span className="product-price">${product.price.toFixed(2)}</span>
        </li>
      ))}
    </ul>
  );
}

export default function App() {
  const [category, setCategory] = useState("all");
  const [failed, setFailed] = useState(false);
  const loadedProducts = failed ? [] : products;
  const error = failed ? "The product list could not be loaded. Try again in a moment." : null;
  const visibleProducts = category === "all" ? loadedProducts : loadedProducts.filter((product) => product.category === category);
  return (
    <main>
      <h1>Product list</h1>
      <p className="lead">Filter by category, or pretend the data failed to load.</p>
      <div className="controls">
        <label>
          Category
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">All</option>
            <option value="beauty">Beauty</option>
            <option value="fragrances">Fragrances</option>
            <option value="groceries">Groceries</option>
            <option value="furniture">Furniture</option>
          </select>
        </label>
        <label>
          <input type="checkbox" checked={failed} onChange={(event) => setFailed(event.target.checked)} />
          Pretend the load failed
        </label>
      </div>
      <ProductList items={visibleProducts} />
    </main>
  );
}
