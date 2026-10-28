import { Caption, Chip, Panel, stageAt } from "../kit.jsx";
import { Shell } from "../three-trees/shell.jsx";
import "../three-trees/shell.css";
import "./styles.css";

export const id = "ci-pipeline";

export const defaults = { stages: ["install", "build", "deploy"], failAt: null };

const NAME = /^[\w .:-]{1,20}$/;
const REPO = "my-first-react";
const SITE = `https://you.github.io/${REPO}/`;
const RUN = 7;
const BEFORE = "1b2c3d4";
const COMMIT = "3f9a2c1";
const MESSAGE = "Change the heading";
const EXIT = "Error: Process completed with exit code 1.";

const LOGS = {
  checkout: {
    run: "Run actions/checkout@v7",
    ok: [
      `Syncing repository: you/${REPO}`,
      `Checking out the ref`,
      `HEAD is now at ${COMMIT} ${MESSAGE}`,
    ],
    fail: [
      `Syncing repository: you/${REPO}`,
      "fatal: could not read from remote repository.",
      EXIT,
    ],
  },
  install: {
    run: "Run npm ci",
    ok: ["added 186 packages, and audited 187 packages in 4s", "", "found 0 vulnerabilities"],
    fail: [
      "npm error code EUSAGE",
      "npm error `npm ci` can only install packages when your package.json and package-lock.json are in sync.",
      EXIT,
    ],
  },
  lint: {
    run: "Run npm run lint",
    ok: [`> ${REPO}@0.0.0 lint`, "> eslint ."],
    fail: [
      `> ${REPO}@0.0.0 lint`,
      "> eslint .",
      "",
      "/home/runner/work/src/App.jsx",
      "  7:5  error  'count' is not defined  no-undef",
      "",
      "✖ 1 problem (1 error, 0 warnings)",
      EXIT,
    ],
  },
  test: {
    run: "Run npm test",
    ok: [
      `> ${REPO}@0.0.0 test`,
      "> vitest run",
      "",
      " Test Files  3 passed (3)",
      "      Tests  12 passed (12)",
    ],
    fail: [
      `> ${REPO}@0.0.0 test`,
      "> vitest run",
      "",
      " FAIL  src/App.test.jsx > shows the heading",
      " Test Files  1 failed | 2 passed (3)",
      "      Tests  1 failed | 11 passed (12)",
      EXIT,
    ],
  },
  build: {
    run: "Run npm run build",
    ok: [
      `> ${REPO}@0.0.0 build`,
      "> vite build",
      "",
      "✓ 32 modules transformed.",
      "dist/index.html                   0.46 kB",
      "dist/assets/index-D8sZ1qaX.css    1.39 kB",
      "dist/assets/index-Bt2-u-hP.js   195.41 kB",
      "✓ built in 612ms",
    ],
    fail: [
      `> ${REPO}@0.0.0 build`,
      "> vite build",
      "",
      "error during build:",
      "src/App.jsx (7:4): Unexpected token. Did you mean `{'>'}` or `&gt;`?",
      EXIT,
    ],
  },
  deploy: {
    run: "Run actions/deploy-pages@v5",
    ok: [
      'Fetching artifact metadata for "github-pages" in this workflow run',
      "Found 1 artifact(s)",
      `Created deployment for ${COMMIT}`,
      "Getting Pages deployment status...",
      "Reported success!",
    ],
    fail: [
      'Fetching artifact metadata for "github-pages" in this workflow run',
      "Error: Get Pages site failed. Please verify that the repository has Pages enabled and configured to build using GitHub Actions.",
      EXIT,
    ],
  },
};

function logFor(name, failed) {
  const known = LOGS[name.toLowerCase()];
  if (known) return [known.run, ...(failed ? known.fail : known.ok)];
  return [`Run ${name}`, ...(failed ? [`${name} failed.`, EXIT] : [`${name} finished.`])];
}

function settings(props) {
  const raw = Array.isArray(props.stages) ? props.stages : [];
  const names = raw.filter((name) => typeof name === "string" && NAME.test(name.trim()));
  const stages =
    names.length >= 1 && names.length <= 6 && names.length === raw.length
      ? names.map((name) => name.trim())
      : defaults.stages;
  const failAt =
    Number.isInteger(props.failAt) && props.failAt >= 0 && props.failAt < stages.length
      ? props.failAt
      : null;
  return { stages, failAt };
}

function build({ stages, failAt }) {
  const last = failAt ?? stages.length - 1;
  const deployAt = stages.findIndex((name) => name.toLowerCase() === "deploy");
  const frames = [
    {
      states: stages.map(() => "queued"),
      run: "queued",
      site: "old",
      shell: [
        {
          command: `git commit -am "${MESSAGE}"`,
          output: [`[main ${COMMIT}] ${MESSAGE}`, " 1 file changed, 1 insertion(+), 1 deletion(-)"],
        },
        {
          command: "git push",
          output: [
            `To https://github.com/you/${REPO}.git`,
            `   ${BEFORE}..${COMMIT}  main -> main`,
          ],
        },
      ],
      caption: `You change the heading, commit, and push. The push starts run #${RUN} of the workflow on GitHub, with every stage queued.${deployAt >= 0 ? " The site still shows the last version that deployed." : ""}`,
    },
  ];
  for (let index = 0; index <= last; index += 1) {
    const failed = index === failAt;
    const name = stages[index];
    const rest = stages.slice(index + 1);
    const done = !failed && index === stages.length - 1;
    const live = deployAt >= 0 && deployAt <= index && !(failed && deployAt === index);
    let caption;
    if (failed) {
      const skipped = rest.length
        ? `${rest.join(", ")} ${rest.length === 1 ? "is" : "are"} skipped and `
        : "";
      caption =
        deployAt >= 0 && !live
          ? `${name} fails, and its log ends with exit code 1. The run stops: ${skipped}nothing is deployed, so the site still serves the last version that passed. Read the log, fix the cause, commit, and push again, or undo the commit with git revert and push that.`
          : `${name} fails, and its log ends with exit code 1. The run stops${rest.length ? `: ${rest.join(", ")} ${rest.length === 1 ? "is" : "are"} skipped` : ""}, and the run is marked as failed. Read the log, fix the cause, commit, and push again.`;
    } else if (done) {
      caption =
        deployAt >= 0
          ? `${name} passes, the last stage. Run #${RUN} is green and the new heading is live at ${SITE}. Every later push runs the same stages again, so the site always matches the last commit that passed them all.`
          : `${name} passes, the last stage, so run #${RUN} is green. Every later push runs the same stages again.`;
    } else {
      caption = `${name} passes: its log shows what it did, and the run moves on to ${stages[index + 1]}.`;
    }
    frames.push({
      states: stages.map((_, other) => {
        if (other < index) return "passed";
        if (other === index) return failed ? "failed" : "passed";
        return failed ? "skipped" : "queued";
      }),
      run: failed ? "failure" : done ? "success" : "running",
      site: live ? "new" : "old",
      current: index,
      log: logFor(name, failed),
      failed,
      caption,
    });
  }
  return { frames, deploys: deployAt >= 0 };
}

export function stepCount(props) {
  return build(settings(props)).frames.length;
}

const STATE = {
  queued: { tone: "muted", text: "queued" },
  passed: { tone: "success", text: "passed" },
  failed: { tone: "danger", text: "failed" },
  skipped: { tone: "muted", text: "skipped" },
};

const RUN_STATE = {
  queued: { tone: "muted", text: "Queued" },
  running: { tone: "warning", text: "In progress" },
  success: { tone: "success", text: "Success" },
  failure: { tone: "danger", text: "Failure" },
};

function Run({ stages, frame }) {
  const state = RUN_STATE[frame.run];
  return (
    <div className="ci-pipeline__run">
      <p className="ci-pipeline__run-head">
        <span className="ci-pipeline__run-title">Deploy to GitHub Pages #{RUN}</span>
        <Chip tone={state.tone}>{state.text}</Chip>
      </p>
      <p className="ci-pipeline__run-meta">
        {MESSAGE} <span className="demo-mono">{COMMIT}</span>
      </p>
      <ol className="ci-pipeline__stages" aria-label="Stages of the run">
        {stages.map((name, index) => {
          const look = STATE[frame.states[index]];
          return (
            <li
              key={`${name}-${index}`}
              className={[
                "ci-pipeline__stage",
                `ci-pipeline__stage--${frame.states[index]}`,
                index === frame.current && "is-current",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className="demo-mono">{name}</span>
              <Chip tone={look.tone}>{look.text}</Chip>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Log({ name, lines, failed }) {
  return (
    <Panel title={`${name} log`} sunken className="ci-pipeline__log-panel">
      <ol className="ci-pipeline__log" aria-label={`Log of ${name}`}>
        {lines.map((line, index) => (
          <li
            key={index}
            className={
              [
                index === 0 && "is-run",
                failed && (line === EXIT || /error|FAIL|✖/i.test(line)) && "is-error",
              ]
                .filter(Boolean)
                .join(" ") || undefined
            }
          >
            {line === "" ? " " : line}
          </li>
        ))}
      </ol>
    </Panel>
  );
}

function Site({ version }) {
  return (
    <div className="ci-pipeline__site">
      <p className="ci-pipeline__bar demo-mono">{SITE}</p>
      <p className="ci-pipeline__page">{version === "new" ? "The Shop" : "Shop"}</p>
      <p className="ci-pipeline__note">
        {version === "new" ? "The new version is live." : "The last version that deployed."}
      </p>
    </div>
  );
}

export default function CiPipeline({ props, step }) {
  const setup = settings(props);
  const { frames, deploys } = build(setup);
  const frame = stageAt(frames, step);
  return (
    <div className="ci-pipeline">
      {frame.shell && (
        <Shell entries={frame.shell.map((entry) => ({ ...entry, fresh: true }))} folder={REPO} />
      )}
      <Run stages={setup.stages} frame={frame} />
      {frame.log && (
        <Log name={setup.stages[frame.current]} lines={frame.log} failed={frame.failed} />
      )}
      {deploys && <Site version={frame.site} />}
      <Caption>{frame.caption}</Caption>
    </div>
  );
}
