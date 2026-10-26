import { useEffect, useState } from "react";
import { loadProducts } from "./api.js";

function ProductCard({ product, variant = "card" }) {
  return (
    <article className={`product product--${variant}`}>
      <h3>{product.title}</h3>
      {variant === "card" && <p className="product-meta">{product.category}, rated {product.rating} of 5</p>}
      <p className="product-price">${product.price.toFixed(2)}</p>
    </article>
  );
}

function ProductList({ items, variant = "card" }) {
  if (items.length === 0) {
    return <p role="status" className="message">No products match this category.</p>;
  }
  return (
    <ul className={`product-list product-list--${variant}`}>
      {items.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} variant={variant} />
        </li>
      ))}
    </ul>
  );
}

export default function App() {
  const [category, setCategory] = useState("all");
  const [request, setRequest] = useState({ status: "loading", products: [], error: null });

  useEffect(() => {
    const controller = new AbortController();
    loadProducts(controller.signal)
      .then((products) => setRequest({ status: "success", products, error: null }))
      .catch((error) => {
        if (!controller.signal.aborted) {
          setRequest({ status: "error", products: [], error: error.message });
        }
      });
    return () => controller.abort();
  }, []);

  const error = request.error;
  const visibleProducts = category === "all" ? request.products : request.products.filter((product) => product.category === category);
  const topRated = visibleProducts.filter((product) => product.rating >= 4.5);
  return (
    <main>
      <h1>Product list</h1>
      <p className="lead">Products from the API source chosen in the toolbar.</p>
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
      </div>
      {error ? (
        <p role="alert" className="message message--error">Could not load products. {error}</p>
      ) : (
        <>
          <h2>Top rated</h2>
          <ProductList items={topRated} variant="row" />
          <h2>All products</h2>
          <ProductList items={visibleProducts} />
        </>
      )}
    </main>
  );
}
