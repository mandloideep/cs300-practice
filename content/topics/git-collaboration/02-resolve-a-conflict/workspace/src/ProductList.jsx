export default function ProductList({ products, onAdd }) {
  return (
    <ul className="product-list">
      {products.map((product) => (
        <li key={product.id} className="product">
          <span className="title">{product.title}</span>
          <span className="price">${product.price.toFixed(2)}</span>
          <button type="button" onClick={() => onAdd(product)}>
            Add to cart
          </button>
        </li>
      ))}
    </ul>
  );
}
