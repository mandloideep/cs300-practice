import { Suspense, lazy, useEffect, useRef } from "react";
import { Route, Routes, useLocation } from "react-router";
import SiteHeader from "./SiteHeader.jsx";
import Home from "./Home.jsx";
import Catalog from "./Catalog.jsx";
import PathPage from "./PathPage.jsx";
import UnitPage from "./UnitPage.jsx";
import NotFound from "./NotFound.jsx";
import { Loading } from "./ContentState.jsx";

const TopicPage = lazy(() => import("./TopicPage.jsx"));

const MAIN_ID = "main-content";

// On every navigation after the first, start at the top of the page and move keyboard focus to
// the main region, so that screen readers and keyboard users begin at the new content.
function useNavigationReset(mainId) {
  const { pathname } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo(0, 0);
    document.getElementById(mainId)?.focus({ preventScroll: true });
  }, [pathname, mainId]);
}

export default function App() {
  useNavigationReset(MAIN_ID);
  return (
    <>
      <SiteHeader mainId={MAIN_ID} />
      <main id={MAIN_ID} className="site-main" tabIndex={-1}>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/topics" element={<Catalog />} />
            <Route path="/topic/:id" element={<TopicPage />} />
            <Route path="/topic/:id/:n" element={<TopicPage />} />
            <Route path="/path/:pathId" element={<PathPage />} />
            <Route path="/path/:pathId/:unit" element={<UnitPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
    </>
  );
}
