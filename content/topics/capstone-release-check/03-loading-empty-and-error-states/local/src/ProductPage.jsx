import { Link, useParams } from "react-router";
import { productsUrl } from "./api.js";
import { useFetch } from "./useFetch.js";

export default function ProductPage() {
  const { id } = useParams();
  const { status, data, error, retry } = useFetch(productsUrl());
  const product = data?.find((item) => String(item.id) === id);

  return (
    <main>
      {status === "loading" && (
        <p role="status" className="message">
          Loading product {id}...
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="message message--error">
          Could not load product {id}. {error.message}
          <button type="button" onClick={retry}>
            Retry
          </button>
        </p>
      )}
      {status === "success" && !product && <h1>No product has the id {id}</h1>}
      {status === "success" && product && (
        <>
          <h1>{product.title}</h1>
          <p className="product-meta">{product.category}</p>
          <p className="product-price">${product.price.toFixed(2)}</p>
          <p>{product.description}</p>
        </>
      )}
      <p>
        <Link to="/products">Back to the products</Link>
      </p>
    </main>
  );
}
