import { useSearchParams } from "react-router";
import { productsUrl } from "./api.js";
import ProductList from "./ProductList.jsx";
import { useFetch } from "./useFetch.js";

export default function ProductsPage() {
  const { status, data, error, retry } = useFetch(productsUrl());
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const products = data ?? [];
  const visible = products.filter((product) =>
    product.title.toLowerCase().includes(query.toLowerCase()),
  );

  function handleSearch(event) {
    const value = event.target.value;
    setSearchParams(value ? { q: value } : {}, { replace: true });
  }

  return (
    <main>
      <h1>Products</h1>
      <label className="search">
        Search
        <input type="search" value={query} onChange={handleSearch} />
      </label>
      {status === "loading" && (
        <p role="status" className="message">
          Loading products...
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="message message--error">
          Could not load products. {error.message}
          <button type="button" onClick={retry}>
            Retry
          </button>
        </p>
      )}
      {status === "success" && products.length === 0 && (
        <p role="status" className="message">
          The catalog is empty. Check back soon.
        </p>
      )}
      {status === "success" && products.length > 0 && visible.length === 0 && (
        <p role="status" className="message">
          No products match {query}.
        </p>
      )}
      {status === "success" && visible.length > 0 && <ProductList items={visible} />}
    </main>
  );
}
