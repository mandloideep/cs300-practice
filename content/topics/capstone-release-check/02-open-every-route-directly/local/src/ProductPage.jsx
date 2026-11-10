import { Link, useLocation, useParams } from "react-router";

export default function ProductPage() {
  const { id } = useParams();
  const location = useLocation();
  const product = location.state?.product;

  return (
    <main>
      {!product && <h1>No product has the id {id}</h1>}
      {product && (
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
