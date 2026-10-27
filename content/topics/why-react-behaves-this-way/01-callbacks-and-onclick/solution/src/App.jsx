const products = [
  { id: 1, title: "Essence Mascara Lash Princess", price: 9.99 },
  { id: 16, title: "Apple", price: 1.99 },
  { id: 20, title: "Cooking Oil", price: 4.99 }
];

function ProductCard({ product }) {
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

export default function App() {
  return (
    <main>
      <h1>Cart</h1>
      <ul className="product-list">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </main>
  );
}
