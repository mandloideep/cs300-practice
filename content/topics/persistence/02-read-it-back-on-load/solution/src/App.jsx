import { useEffect, useState } from "react";

const products = [
  { id: 1, title: "Essence Mascara Lash Princess", category: "beauty", price: 9.99 },
  { id: 3, title: "Powder Canister", category: "beauty", price: 14.99 },
  { id: 6, title: "Calvin Klein CK One", category: "fragrances", price: 49.99 },
  { id: 8, title: "Dior J'adore", category: "fragrances", price: 89.99 },
  { id: 16, title: "Apple", category: "groceries", price: 1.99 },
  { id: 20, title: "Cooking Oil", category: "groceries", price: 4.99 }
];

function ProductCard({ product, saved, onToggle }) {
  return (
    <article className="product">
      <h3>{product.title}</h3>
      <p className="product-meta">{product.category}</p>
      <p className="product-price">${product.price.toFixed(2)}</p>
      <button type="button" className="save" aria-pressed={saved} onClick={() => onToggle(product.id)}>
        {saved ? "Saved for later" : "Save for later"}
      </button>
    </article>
  );
}

function ProductList({ items, savedIds, onToggle }) {
  return (
    <ul className="product-list">
      {items.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} saved={savedIds.includes(product.id)} onToggle={onToggle} />
        </li>
      ))}
    </ul>
  );
}

export default function App() {
  const [savedIds, setSavedIds] = useState(() => {
    const stored = localStorage.getItem("saved-for-later");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("saved-for-later", JSON.stringify(savedIds));
  }, [savedIds]);

  function handleToggle(id) {
    setSavedIds(savedIds.includes(id) ? savedIds.filter((savedId) => savedId !== id) : [...savedIds, id]);
  }

  return (
    <main>
      <h1>Product list</h1>
      <p className="lead">{savedIds.length} of {products.length} products saved for later.</p>
      <ProductList items={products} savedIds={savedIds} onToggle={handleToggle} />
    </main>
  );
}
