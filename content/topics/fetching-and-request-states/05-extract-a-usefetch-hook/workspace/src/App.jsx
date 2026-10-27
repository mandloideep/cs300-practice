import { useEffect, useState } from "react";
import { loadJson, productsUrl } from "./api.js";

function ProductCard({ product }) {
  return (
    <article className="product">
      <h3>{product.title}</h3>
      <p className="product-meta">{product.category}, rated {product.rating} of 5</p>
      <p className="product-price">${product.price.toFixed(2)}</p>
    </article>
  );
}

function ProductList({ items }) {
  if (items.length === 0) {
    return <p role="status" className="message">No products to show.</p>;
  }
  return (
    <ul className="product-list">
      {items.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}

export default function App() {
  const [category, setCategory] = useState("beauty");
  const [attempt, setAttempt] = useState(0);
  const [request, setRequest] = useState({ status: "loading", data: null, error: null });

  useEffect(() => {
    const controller = new AbortController();
    setRequest({ status: "loading", data: null, error: null });
    loadJson(productsUrl(category), controller.signal)
      .then((data) => {
        setRequest({ status: "success", data, error: null });
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setRequest({ status: "error", data: null, error: error.message });
        }
      });
    return () => controller.abort();
  }, [category, attempt]);

  const products = request.data ? request.data.products : [];

  return (
    <main>
      <h1>Product list</h1>
      <p className="lead">Products from the API source chosen in the toolbar.</p>
      <div className="controls">
        <label>
          Category
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="beauty">Beauty</option>
            <option value="fragrances">Fragrances</option>
            <option value="groceries">Groceries</option>
            <option value="furniture">Furniture</option>
            <option value="laptops">Laptops</option>
          </select>
        </label>
      </div>
      {request.status === "loading" && <p role="status" className="message">Loading products...</p>}
      {request.status === "error" && (
        <p role="alert" className="message message--error">
          Could not load products. {request.error}
          <button type="button" onClick={() => setAttempt(attempt + 1)}>Retry</button>
        </p>
      )}
      {request.status === "success" && <ProductList items={products} />}
    </main>
  );
}
