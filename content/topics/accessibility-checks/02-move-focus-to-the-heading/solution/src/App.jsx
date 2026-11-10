import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation, useParams, useSearchParams } from "react-router";
import { logo } from "./logo.js";
import { categories, products } from "./products.js";

function HomePage() {
  return (
    <main>
      <h1 tabIndex={-1}>Welcome to the shop</h1>
      <p className="lead">Browse the catalog by category, or search it by name.</p>
    </main>
  );
}

function ProductCard({ product }) {
  return (
    <li>
      <span className="product-title">{product.title}</span>
      <span className="product-price">${product.price.toFixed(2)}</span>
      <Link to={"/products/" + product.id}>View details</Link>
    </li>
  );
}

function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [category, setCategory] = useState("all");
  const matching = products.filter((product) =>
    product.title.toLowerCase().includes(query.toLowerCase())
  );
  const shown = categories.filter((section) => category === "all" || section.id === category);

  function handleSearch(event) {
    const value = event.target.value;
    setSearchParams(value ? { q: value } : {}, { replace: true });
  }

  return (
    <main>
      <h1 tabIndex={-1}>Products</h1>
      <div className="controls">
        <div className="field">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            type="search"
            value={query}
            onChange={handleSearch}
          />
        </div>
        <div className="field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="all">All categories</option>
            <option value="beauty">Beauty</option>
            <option value="fragrances">Fragrances</option>
          </select>
        </div>
      </div>
      {shown.map((section) => (
        <section key={section.id}>
          <h3>{section.title}</h3>
          <ul className="product-list">
            {matching
              .filter((product) => product.category === section.id)
              .map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
          </ul>
        </section>
      ))}
    </main>
  );
}

function ProductPage() {
  const { id } = useParams();
  const product = products.find((item) => item.id === Number(id));
  if (!product) {
    return (
      <main>
        <h1 tabIndex={-1}>No product has the id {id}</h1>
        <p><Link to="/products">Back to the products</Link></p>
      </main>
    );
  }
  return (
    <main>
      <h1 tabIndex={-1}>{product.title}</h1>
      <p className="product-meta">{product.category}</p>
      <p className="product-price">${product.price.toFixed(2)}</p>
      <p><Link to="/products">Back to the products</Link></p>
    </main>
  );
}

function NotFoundPage() {
  return (
    <main>
      <h1 tabIndex={-1}>Page not found</h1>
      <p>There is no page at this address. <Link to="/">Go to the home page</Link></p>
    </main>
  );
}

function RouteFocus() {
  const { pathname } = useLocation();
  const previous = useRef(pathname);

  useEffect(() => {
    if (previous.current === pathname) {
      return;
    }
    previous.current = pathname;
    document.querySelector("main h1")?.focus();
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteFocus />
      <header className="site-header">
        <Link className="logo" to="/">
          <img src={logo} width="32" height="32" />
        </Link>
        <nav className="site-nav" aria-label="Site">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/products">Products</NavLink>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
