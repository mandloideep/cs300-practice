console.log("ProductCard.jsx ran");

export default function ProductCard({ product }) {
  function handleAdd(quantity) {
    console.log("Added to the cart:", quantity, "x", product.title);
  }

  return (
    <article className="product">
      <h3>{product.title}</h3>
      <p className="product-price">${product.price.toFixed(2)}</p>
      <div className="cart-controls">
        <button type="button" onClick={() => handleAdd(1)}>Add one</button>
        <button type="button" onClick={() => handleAdd(3)}>Add three</button>
      </div>
    </article>
  );
}
