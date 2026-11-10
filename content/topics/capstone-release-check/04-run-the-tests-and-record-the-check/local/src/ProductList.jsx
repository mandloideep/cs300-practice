import { Link } from "react-router";
import { formatPrice } from "./format.js";

export default function ProductList({ items }) {
  return (
    <ul className="product-list">
      {items.map((product) => (
        <li key={product.id}>
          <Link className="product-title" to={`/products/${product.id}`}>
            {product.title}
          </Link>
          <span className="product-price">{formatPrice(product.price)}</span>
        </li>
      ))}
    </ul>
  );
}
