import { products } from "./products.js";

function HomePage() {
  return (
    <main>
      <h1>Welcome to the shop</h1>
      <p className="lead">{products.length} products in stock. Open the Products page to browse them.</p>
    </main>
  );
}

function ProductsPage() {
  return (
    <main>
      <h1>Products</h1>
      <ul className="product-list">
        {products.map((product) => (
          <li key={product.id}>
            <span className="product-title">{product.title}</span>
            <span className="product-price">${product.price.toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default function App() {
  return <HomePage />;
}
