import { Link, NavLink, Route, Routes } from "react-router";
import ProductPage from "./ProductPage.jsx";
import ProductsPage from "./ProductsPage.jsx";

function HomePage() {
  return (
    <main>
      <h1>Welcome to the shop</h1>
      <p className="lead">Open the Products page to browse the catalog.</p>
    </main>
  );
}

function NotFoundPage() {
  return (
    <main>
      <h1>Page not found</h1>
      <p>
        There is no page at this address. <Link to="/">Go to the home page</Link>
      </p>
    </main>
  );
}

export default function App() {
  return (
    <>
      <nav className="site-nav" aria-label="Site">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/products">Products</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
