import { Link } from "react-router";
import { NotFoundNotice } from "./ContentState.jsx";

export default function NotFound() {
  return (
    <NotFoundNotice what="Page" standalone>
      <p>
        This address does not match any page. <Link to="/">Go home</Link> or{" "}
        <Link to="/topics">browse the topics</Link>.
      </p>
    </NotFoundNotice>
  );
}
