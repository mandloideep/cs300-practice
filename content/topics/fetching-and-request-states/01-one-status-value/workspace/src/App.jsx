import { useEffect, useState } from "react";
import { loadProducts } from "./api.js";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadProducts()
      .then((result) => {
        setProducts(result);
        setLoading(false);
      })
      .catch((failure) => {
        setError(failure.message);
      });
  }, []);

  return (
    <main>
      <h1>Product list</h1>
      <p className="lead">Products from the API source chosen in the toolbar.</p>
      {loading && <p role="status" className="message">Loading products...</p>}
      {error && <p role="alert" className="message message--error">Could not load products. {error}</p>}
      {!loading && !error && <ProductList items={products} />}
    </main>
  );
}
