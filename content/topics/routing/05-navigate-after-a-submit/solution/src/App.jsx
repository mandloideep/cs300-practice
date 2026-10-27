import { useState } from "react";
import { BrowserRouter, Link, NavLink, Route, Routes, useNavigate, useParams } from "react-router";
import { products } from "./products.js";

function HomePage({ count }) {
  return (
    <main>
      <h1>Welcome to the shop</h1>
      <p className="lead">{count} products in stock. Open the Products page to browse them.</p>
    </main>
  );
}

function ProductsPage({ items }) {
  return (
    <main>
      <h1>Products</h1>
      <ul className="product-list">
        {items.map((product) => (
          <li key={product.id}>
            <Link className="product-title" to={`/products/${product.id}`}>{product.title}</Link>
            <span className="product-price">${product.price.toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}

function ProductPage({ items }) {
  const { id } = useParams();
  const product = items.find((item) => item.id === Number(id));
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

function NewProductPage({ onAdd }) {
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const product = {
      id: Date.now(),
      title: form.elements.title.value,
      category: form.elements.category.value,
      price: Number(form.elements.price.value)
    };
    onAdd(product);
    navigate(`/products/${product.id}`);
  }

  return (
    <main>
      <h1>Add a product</h1>
      <form className="add-form" onSubmit={handleSubmit}>
        <label>
          Title
          <input name="title" type="text" required />
        </label>
        <label>
          Price
          <input name="price" type="number" min="0" step="0.01" required />
        </label>
        <label>
          Category
          <select name="category">
            <option value="beauty">Beauty</option>
            <option value="fragrances">Fragrances</option>
            <option value="groceries">Groceries</option>
          </select>
        </label>
        <button type="submit">Add product</button>
      </form>
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
  const [items, setItems] = useState(products);

  function handleAdd(product) {
    setItems([...items, product]);
  }

  return (
    <BrowserRouter>
      <nav className="site-nav" aria-label="Site">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/products" end>Products</NavLink>
        <NavLink to="/products/new">Add a product</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage count={items.length} />} />
        <Route path="/products" element={<ProductsPage items={items} />} />
        <Route path="/products/new" element={<NewProductPage onAdd={handleAdd} />} />
        <Route path="/products/:id" element={<ProductPage items={items} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
