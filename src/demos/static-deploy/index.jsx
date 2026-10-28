import { useState } from "react";
import { Caption, Chip, Choice, Panel, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "static-deploy";

export const defaults = {
  repo: "my-first-react",
  route: "/products/3",
  notFoundPage: false,
  base: "./",
};

const REPO = /^[\w.-]{1,40}$/;
const ROUTE = /^\/[\w/-]{0,30}$/;
const HOST = "https://you.github.io";
const SCRIPT = "assets/index-Bt2-u-hP.js";
const STYLES = "assets/index-D8sZ1qaX.css";

function settings(props) {
  const repo = typeof props.repo === "string" && REPO.test(props.repo) ? props.repo : defaults.repo;
  const route =
    typeof props.route === "string" && ROUTE.test(props.route) && !props.route.includes("//")
      ? props.route
      : defaults.route;
  const notFoundPage =
    typeof props.notFoundPage === "boolean" ? props.notFoundPage : defaults.notFoundPage;
  const bases = ["./", `/${repo}/`, "/"];
  const base = bases.includes(props.base) ? props.base : defaults.base;
  return { repo, route, notFoundPage, base, bases };
}

function files(notFoundPage) {
  return ["index.html", ...(notFoundPage ? ["404.html"] : []), SCRIPT, STYLES, "favicon.svg"];
}

function answer(url, { repo, notFoundPage }) {
  const { pathname } = new URL(url);
  const folder = `/${repo}/`;
  if (`${pathname}/` === folder) return { status: 301, file: null };
  if (!pathname.startsWith(folder)) return { status: 404, file: null };
  const rest = pathname.slice(folder.length);
  const wanted = rest === "" || rest.endsWith("/") ? `${rest}index.html` : rest;
  if (files(notFoundPage).includes(wanted)) return { status: 200, file: wanted };
  return notFoundPage ? { status: 404, file: "404.html" } : { status: 404, file: null };
}

function visit(url, setup) {
  const page = answer(url, setup);
  const requests = [{ url, ...page }];
  if (!page.file) return { requests, result: "github404" };
  const assets = [SCRIPT, STYLES].map((path) => {
    const resolved = new URL(`${setup.base}${path}`, url).href;
    return { url: resolved, ...answer(resolved, setup), path };
  });
  requests.push(...assets);
  const loaded = assets.every((asset) => asset.status === 200 && asset.file === asset.path);
  return { requests, result: loaded ? "app" : "blank" };
}

function script(outcome) {
  return outcome.requests.find((request) => request.path === SCRIPT);
}

function short(url) {
  return url.replace(HOST, "");
}

function build(setup) {
  const { repo, route, base } = setup;
  const site = `${HOST}/${repo}/`;
  const routeUrl = `${HOST}/${repo}${route}`;
  const home = visit(site, setup);
  const refresh = visit(routeUrl, setup);
  const hash = visit(site, setup);
  const isHome = route === "/";

  const homeCaption =
    home.result === "app"
      ? `The browser asks for ${short(site)} and the host answers with index.html. Its script tag says ${base}${SCRIPT}, which the browser resolves against the page's address to ${short(script(home).url)}: a file the host has, so React starts.`
      : `The host answers ${short(site)} with index.html, but its script tag says ${base}${SCRIPT}. A path that starts with / is read from the top of the address, so the browser asks for ${short(script(home).url)}, outside the project's folder. The host answers 404, the script never runs, and the page is blank.`;

  let refreshCaption;
  if (isHome) {
    refreshCaption = `A refresh at the home route asks for ${short(site)} again, and the host has index.html for it, so the page loads the same way with or without a 404.html.`;
  } else if (refresh.result === "github404") {
    refreshCaption = `A refresh asks the host for ${short(routeUrl)}. There is no file at that path in dist/, and no 404.html, so GitHub Pages answers with its own 404 page. Your app never loads.`;
  } else if (refresh.result === "blank") {
    refreshCaption =
      base === "./"
        ? `There is no file at ${short(routeUrl)}, so the host answers with 404.html, the copy of index.html. But ./ is read from the route's folder, so the script is requested at ${short(script(refresh).url)}, which does not exist, and the page is blank. A 404.html needs base: "/${repo}/".`
        : `The host answers with 404.html, but its script tag starts with /, so the script is requested outside the project's folder and the page is blank.`;
  } else {
    refreshCaption = `There is no file at ${short(routeUrl)}, so GitHub Pages answers with 404.html, the copy of index.html. Its paths start with /${repo}/, so the script loads from any route, React starts, and React Router, given basename="/${repo}", shows ${route}.`;
  }

  return [
    {
      view: "dist",
      caption: `npm run build writes the finished site into dist/: index.html, the bundled script and stylesheet under assets/, and the files from public/.${setup.notFoundPage ? " The workflow also copies index.html to 404.html." : ""} A static host serves these files as they are and runs nothing.`,
    },
    {
      view: "addresses",
      caption: `GitHub Pages publishes dist/ for the repository ${repo} under ${site}. Each file's address is that folder followed by the file's path inside dist/.`,
    },
    {
      view: "visit",
      address: site,
      outcome: home,
      caption: homeCaption,
    },
    {
      view: "navigate",
      address: routeUrl,
      outcome: home.result === "app" ? { requests: [], result: "app" } : home,
      caption:
        home.result !== "app"
          ? "The page never loaded, so there is no link to click. Fix the base first."
          : isHome
            ? "You are already on the home route, and the router shows it without asking the host for anything."
            : `You click a link to ${route}. React Router changes the address in the bar and draws the page itself; nothing is requested from the host, so it works.`,
    },
    {
      view: "refresh",
      address: routeUrl,
      outcome: refresh,
      caption: refreshCaption,
    },
    {
      view: "hash",
      address: isHome ? site : `${site}#${route}`,
      outcome: hash,
      caption:
        hash.result === "app"
          ? `With HashRouter the route lives after the #, as ${short(site)}#${route}. The browser never sends the part after # to the host, so every refresh asks for ${short(site)}, gets index.html, and the router reads the route from the hash.`
          : 'HashRouter keeps every request at the folder\'s address, but with base: "/" the script is still requested outside the folder, so fix the base first.',
    },
  ];
}

export function stepCount() {
  return 6;
}

const RESULT = {
  app: { tone: "success", text: "The app runs" },
  blank: { tone: "danger", text: "A blank page" },
  github404: { tone: "danger", text: "GitHub's 404 page" },
};

function Dist({ notFoundPage }) {
  return (
    <Panel title="dist/" className="static-deploy__panel">
      <ul className="static-deploy__tree" aria-label="Files in dist">
        {files(notFoundPage).map((path) => (
          <li key={path} className="static-deploy__file">
            <span className="demo-mono">{path}</span>
            {path === "404.html" && <Chip tone="accent">copy of index.html</Chip>}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function Addresses({ repo, notFoundPage }) {
  return (
    <Panel title="Published addresses" className="static-deploy__panel">
      <ul className="static-deploy__addresses" aria-label="Each file and its address">
        {files(notFoundPage).map((path) => (
          <li key={path}>
            <span className="demo-mono static-deploy__path">{path}</span>
            <span className="static-deploy__arrow" aria-hidden="true">
              ↓
            </span>
            <span className="visually-hidden"> is served at </span>
            <span className="demo-mono static-deploy__url">
              {HOST}/{repo}/{path}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function Requests({ outcome }) {
  if (outcome.requests.length === 0) {
    return <p className="demo-empty">No request goes to the host.</p>;
  }
  return (
    <ol className="static-deploy__requests" aria-label="Requests to the host">
      {outcome.requests.map((request, index) => {
        const ok = request.status === 200 && (!request.path || request.file === request.path);
        const served =
          request.status === 301
            ? "redirect to the folder"
            : request.file
              ? request.file
              : "GitHub's 404 page";
        return (
          <li
            key={index}
            className={ok ? "static-deploy__request" : "static-deploy__request is-failed"}
          >
            <span className="demo-mono static-deploy__url">GET {short(request.url)}</span>
            <span className="static-deploy__status">
              <Chip tone={ok ? "success" : "danger"}>{request.status}</Chip>
              <span>{served}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Browser({ address, outcome, route }) {
  const result = RESULT[outcome.result];
  return (
    <div className="static-deploy__browser">
      <p className="static-deploy__bar">
        <span className="visually-hidden">Address: </span>
        <span className="demo-mono">{address}</span>
      </p>
      <Requests outcome={outcome} />
      <p className={`static-deploy__result static-deploy__result--${result.tone}`}>
        {result.text}
        {outcome.result === "app" && route !== "/" && address.includes(route) && (
          <>
            {" "}
            at <span className="demo-mono">{route}</span>
          </>
        )}
      </p>
    </div>
  );
}

export default function StaticDeploy({ props, step }) {
  const initial = settings(props);
  const [base, setBase] = useState(initial.base);
  const [notFoundPage, setNotFoundPage] = useState(initial.notFoundPage);
  const setup = { ...initial, base, notFoundPage };
  const stage = stageAt(build(setup), step);

  return (
    <div className="static-deploy">
      <div className="static-deploy__settings">
        <Choice
          legend="base in vite.config.js"
          options={setup.bases.map((value) => ({ value, label: `"${value}"` }))}
          value={base}
          onChange={setBase}
        />
        <Choice
          legend="dist/404.html"
          options={[
            { value: "no", label: "None" },
            { value: "yes", label: "Copy of index.html" },
          ]}
          value={notFoundPage ? "yes" : "no"}
          onChange={(value) => setNotFoundPage(value === "yes")}
        />
      </div>
      {stage.view === "dist" && <Dist notFoundPage={notFoundPage} />}
      {stage.view === "addresses" && <Addresses repo={setup.repo} notFoundPage={notFoundPage} />}
      {stage.outcome && (
        <Browser address={stage.address} outcome={stage.outcome} route={setup.route} />
      )}
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
