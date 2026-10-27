import { useState } from "react";
import { BrowserRouter, Link, NavLink, Route, Routes, useParams } from "react-router";
import { productUrl, productsUrl } from "./api.js";
import { useFetch } from "./useFetch.js";

function HomePage({ savedCount }) {
  return (
    <main>
      <h1>Welcome to the shop</h1>
      <p className="lead">Open the Products page to browse the catalog.</p>
      <p role="status" className="message">You have saved {savedCount} products.</p>
    </main>
  );
}

function ProductList({ items }) {
  return (
    <ul className="product-list">
      {items.map((product) => (
        <li key={product.id}>
          <Link className="product-title" to={`/products/${product.id}`}>{product.title}</Link>
          <span className="product-price">${product.price.toFixed(2)}</span>
        </li>
      ))}
    </ul>
  );
}

function ProductsPage() {
  const { status, data, error, retry } = useFetch(productsUrl());
  return (
    <main>
      <h1>Products</h1>
      {status === "loading" && <p role="status" className="message">Loading products...</p>}
      {status === "error" && (
        <p role="alert" className="message message--error">
          Could not load products. {error.message}
          <button type="button" onClick={retry}>Retry</button>
        </p>
      )}
      {status === "success" && <ProductList items={data.products} />}
    </main>
  );
}

function ProductPage({ saved, onToggleSave }) {
  const { id } = useParams();
  const { status, data, error, retry } = useFetch(productUrl(id));
  const isSaved = saved.includes(Number(id));
  return (
    <main>
      {status === "loading" && <p role="status" className="message">Loading product {id}...</p>}
      {status === "error" && error.status === 404 && (
        <>
          <h1>No product has the id {id}</h1>
          <p>It may have been removed from the catalog after the list was loaded.</p>
        </>
      )}
      {status === "error" && error.status !== 404 && (
        <p role="alert" className="message message--error">
          Could not load product {id}. {error.message}
          <button type="button" onClick={retry}>Retry</button>
        </p>
      )}
      {status === "success" && (
        <>
          <h1>{data.title}</h1>
          <p className="product-meta">{data.category}</p>
          <p className="product-price">${data.price.toFixed(2)}</p>
          <p>{data.description}</p>
          <p>
            <button type="button" aria-pressed={isSaved} onClick={() => onToggleSave(data.id)}>
              {isSaved ? "Remove from saved" : "Save for later"}
            </button>
          </p>
          <p><Link to={`/products/${Number(id) + 1}`}>Next product</Link></p>
        </>
      )}
      <p><Link to="/products">Back to the products</Link></p>
    </main>
  );
}

function NotFoundPage() {
  return (
    <main>
      <h1>Page not found</h1>
      <p>There is no page at this address. <Link to="/">Go to the home page</Link></p>
    </main>
  );
}

export default function App() {
  const [saved, setSaved] = useState([]);

  function handleToggleSave(id) {
    if (saved.includes(id)) {
      setSaved(saved.filter((item) => item !== id));
    } else {
      setSaved([...saved, id]);
    }
  }

  return (
    <BrowserRouter>
      <nav className="site-nav" aria-label="Site">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/products">Products</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage savedCount={saved.length} />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductPage saved={saved} onToggleSave={handleToggleSave} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
