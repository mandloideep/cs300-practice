import { Suspense } from "react";
import { Route, Routes } from "react-router";
import SiteHeader from "./SiteHeader.jsx";
import Home from "./Home.jsx";
import Catalog from "./Catalog.jsx";
import TopicPage from "./TopicPage.jsx";
import PathPage from "./PathPage.jsx";
import UnitPage from "./UnitPage.jsx";
import NotFound from "./NotFound.jsx";
import { Loading } from "./ContentState.jsx";

const MAIN_ID = "main-content";

export default function App() {
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
