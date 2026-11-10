import { Link } from "react-router";

export default function ProductList({ items }) {
  return (
    <ul className="product-list">
      {items.map((product) => (
        <li key={product.id}>
          <Link className="product-title" to={`/products/${product.id}`}>
            {product.title}
          </Link>
          <span className="product-price">${product.price.toFixed(2)}</span>
        </li>
      ))}
    </ul>
  );
}
