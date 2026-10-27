import { Link, NavLink } from "react-router";
import { openTour, useTour } from "../ui/tourStore.js";

export default function SiteHeader({ mainId }) {
  const tour = useTour();
  function skipToMain(event) {
    event.preventDefault();
    const main = document.getElementById(mainId);
    main?.focus();
    main?.scrollIntoView();
  }

  return (
    <header className="site-header">
      <a className="skip-link" href={`#${mainId}`} onClick={skipToMain}>
        Skip to content
      </a>
      <div className="site-header__inner">
        <Link className="site-brand" to="/">
          CS300 <span>Lab</span>
        </Link>
        <nav className="site-nav" aria-label="Main">
          <ul>
            <li>
              <NavLink to="/" end>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/topics">Topics</NavLink>
            </li>
            {tour.available > 0 && (
              <li>
                <button
                  type="button"
                  className="site-nav__button"
                  aria-haspopup="dialog"
                  onClick={openTour}
                >
                  Tour
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
