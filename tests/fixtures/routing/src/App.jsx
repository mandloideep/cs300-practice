import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";

const products = [
  { id: "1", name: "Notebook" },
  { id: "2", name: "Pencil" },
];

function Home() {
  const navigate = useNavigate();
  return (
    <section>
      <h1>Home</h1>
      <button type="button" id="see-products" onClick={() => navigate("/products")}>
        See products
      </button>
    </section>
  );
}

function ProductList() {
  return (
    <section>
      <h1>Products</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <Link to={`/products/${product.id}`}>{product.name}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProductDetail() {
  const { id } = useParams();
  const product = products.find((candidate) => candidate.id === id);
  return (
    <section>
      <h1 id="detail">{product ? product.name : "No such product"}</h1>
      <p>Product {id}</p>
    </section>
  );
}

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  return (
    <section>
      <h1>Search</h1>
      <label>
        Query
        <input
          id="query"
          value={query}
          onChange={(event) => setSearchParams(event.target.value ? { q: event.target.value } : {})}
        />
      </label>
      <p id="query-echo">{query ? `Searching for ${query}` : "Type to search"}</p>
    </section>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link> <Link to="/products">Products</Link>{" "}
        <Link to="/search">Search</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="*" element={<h1>Not found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
