import { BrowserRouter, Link, NavLink, Route, Routes, useParams } from "react-router";
import { products } from "./products.js";
import { productsUrl } from "./api.js";
import { useFetch } from "./useFetch.js";

function HomePage() {
  return (
    <main>
      <h1>Welcome to the shop</h1>
      <p className="lead">Open the Products page to browse the catalog.</p>
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
          Could not load products. {error}
          <button type="button" onClick={retry}>Retry</button>
        </p>
      )}
      {status === "success" && <ProductList items={data.products} />}
    </main>
  );
}

function ProductPage() {
  const { id } = useParams();
  const product = products.find((item) => item.id === Number(id));
  if (!product) {
    return (
      <main>
        <h1>No product has the id {id}</h1>
        <p><Link to="/products">Back to the products</Link></p>
      </main>
    );
  }
  return (
    <main>
      <h1>{product.title}</h1>
      <p className="product-meta">{product.category}</p>
      <p className="product-price">${product.price.toFixed(2)}</p>
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
  return (
    <BrowserRouter>
      <nav className="site-nav" aria-label="Site">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/products">Products</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
