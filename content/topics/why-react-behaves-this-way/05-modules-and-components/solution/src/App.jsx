import ProductCard from "./ProductCard.jsx";

const products = [
  { id: 1, title: "Essence Mascara Lash Princess", price: 9.99 },
  { id: 16, title: "Apple", price: 1.99 },
  { id: 20, title: "Cooking Oil", price: 4.99 }
];

console.log("App.jsx ran");

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
