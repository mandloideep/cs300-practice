const products = [
  { id: 1, title: "Essence Mascara Lash Princess", price: 9.99 },
  { id: 16, title: "Apple", price: 1.99 },
  { id: 20, title: "Cooking Oil", price: 4.99 }
];

function ProductCard({ product }) {
  function handleAdd() {
    console.log("Added to the cart:", product.title);
  }

  return (
    <article className="product">
      <h3>{product.title}</h3>
      <p className="product-price">${product.price.toFixed(2)}</p>
      <button type="button" onClick={handleAdd()}>Add to cart</button>
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
