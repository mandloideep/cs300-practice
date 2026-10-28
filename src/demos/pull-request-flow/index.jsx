import { Caption, Chip, stageAt } from "../kit.jsx";
import { Shell } from "../three-trees/shell.jsx";
import "../three-trees/shell.css";
import "./styles.css";

export const id = "pull-request-flow";

export const defaults = {
  branch: "cart",
  title: "Add the cart",
  checks: ["lint", "test", "build"],
};

const BRANCH = /^(?!main$)[a-z0-9][a-z0-9._/-]{0,19}$/;
const CHECK = /^[\w .:/-]{1,24}$/;
const REPO = "study-plan";
const REMOTE = `https://github.com/you/${REPO}`;
const NUMBER = 12;
const MAIN_BEFORE = "6134b4c";
const FIRST = "1a2b3c4";
const FIX = "5e6f7a8";
const MERGED = "9c1d2e3";
const FIX_MESSAGE = "Rename a variable as review asked";

function settings(props) {
  const branch =
    typeof props.branch === "string" && BRANCH.test(props.branch) ? props.branch : defaults.branch;
  const title =
    typeof props.title === "string" && props.title.trim() !== "" && props.title.length <= 60
      ? props.title.trim()
      : defaults.title;
  const given = Array.isArray(props.checks)
    ? props.checks.filter((check) => typeof check === "string" && CHECK.test(check))
    : [];
  const checks =
    given.length >= 1 && given.length <= 5 && given.length === props.checks.length
      ? given
      : defaults.checks;
  return { branch, title, checks };
}

function joinWords(items) {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function build({ branch, title, checks }) {
  const opened = { kind: "opened", text: "You opened this pull request." };
  const review = {
    kind: "changes",
    text: "A teammate requested changes:",
    quote: "Could this variable have a clearer name, one that says what it holds?",
  };
  const fixed = { kind: "commit", text: `You added 1 commit: ${FIX} ${FIX_MESSAGE}.` };
  const approved = { kind: "approved", text: "The teammate approved these changes." };
  const merged = { kind: "merged", text: `You merged commit ${MERGED} into main.` };
  const deleted = { kind: "deleted", text: `You deleted the ${branch} branch.` };
  const running = checks.map((name, index) => ({
    name,
    state:
      index === 0 && checks.length > 1
        ? "passed"
        : index === 1 || checks.length === 1
          ? "running"
          : "queued",
  }));
  const passed = checks.map((name) => ({ name, state: "passed" }));

  return [
    {
      pr: null,
      run: [
        {
          command: `git push -u origin ${branch}`,
          output: [
            "remote:",
            `remote: Create a pull request for '${branch}' on GitHub by visiting:`,
            `remote:      ${REMOTE}/pull/new/${branch}`,
            "remote:",
            `To ${REMOTE}.git`,
            ` * [new branch]      ${branch} -> ${branch}`,
            `branch '${branch}' set up to track 'origin/${branch}'.`,
          ],
        },
      ],
      caption: `You finished the work on ${branch} and push the branch to GitHub. GitHub now has ${branch}, but main does not have its commit yet, and GitHub prints the address to open a pull request.`,
    },
    {
      pr: { state: "open", commits: 1, timeline: [opened], checks: null, merge: "waiting" },
      fresh: "opened",
      caption: `A pull request asks to merge ${branch} into main. It has a title, a description of what changed and why, the commits, and the diff under Files changed, all in one place for review.`,
    },
    {
      pr: { state: "open", commits: 1, timeline: [opened, review], checks: null, merge: "changes" },
      fresh: "changes",
      caption:
        "A teammate reads the diff and comments on a line. A review comment is about the code, not about you: answer it, change the code or explain why not.",
    },
    {
      pr: {
        state: "open",
        commits: 2,
        timeline: [opened, review, fixed, approved],
        checks: null,
        merge: "approved",
      },
      fresh: "approved",
      run: [
        {
          command: `git commit -am "${FIX_MESSAGE}"`,
          output: [
            `[${branch} ${FIX}] ${FIX_MESSAGE}`,
            " 1 file changed, 3 insertions(+), 3 deletions(-)",
          ],
        },
        {
          command: "git push",
          output: [`To ${REMOTE}.git`, `   ${FIRST}..${FIX}  ${branch} -> ${branch}`],
        },
      ],
      caption: `You fix it on the same branch and push. The pull request picks up the new commit by itself, with no new pull request, and the teammate approves.`,
    },
    {
      pr: {
        state: "open",
        commits: 2,
        timeline: [opened, review, fixed, approved],
        checks: running,
        merge: "checks",
      },
      fresh: "checks",
      caption: `Each push to the branch of a pull request starts the checks: the repository's workflow runs ${joinWords(checks)} on GitHub's computers. The run for your fix is under way, and merging waits until it finishes.`,
    },
    {
      pr: {
        state: "open",
        commits: 2,
        timeline: [opened, review, fixed, approved],
        checks: passed,
        merge: "ready",
      },
      fresh: "checks",
      caption: `All checks have passed, the review is approved, and ${branch} has no conflicts with main, so the pull request can be merged.`,
    },
    {
      pr: {
        state: "merged",
        commits: 2,
        timeline: [opened, review, fixed, approved, merged],
        checks: passed,
        merge: "merged",
      },
      fresh: "merged",
      caption: `You press Merge pull request. GitHub makes merge commit ${MERGED} on main, whose message is "Merge pull request #${NUMBER} from you/${branch}", and main now has the work.`,
    },
    {
      pr: {
        state: "merged",
        commits: 2,
        timeline: [opened, review, fixed, approved, merged, deleted],
        checks: passed,
        merge: "deleted",
      },
      fresh: "deleted",
      run: [
        {
          command: "git switch main",
          output: ["Switched to branch 'main'", "Your branch is up to date with 'origin/main'."],
        },
        {
          command: "git pull",
          output: [
            `From ${REMOTE}`,
            `   ${MAIN_BEFORE}..${MERGED}  main       -> origin/main`,
            `Updating ${MAIN_BEFORE}..${MERGED}`,
            "Fast-forward",
          ],
        },
        { command: `git branch -d ${branch}`, output: [`Deleted branch ${branch} (was ${FIX}).`] },
      ],
      caption: `The ${branch} branch has done its job, so you delete it on GitHub, then pull main on your computer and delete your own copy. "${title}" is in main for good, and the next task starts from a fresh branch.`,
    },
  ];
}

export function stepCount() {
  return 8;
}

const MERGE_BOX = {
  waiting: { tone: "muted", text: "Checks have not reported yet." },
  changes: { tone: "danger", text: "Changes requested: a reviewer asked for changes." },
  approved: { tone: "success", text: "Approved: a reviewer approved these changes." },
  checks: { tone: "warning", text: "Merging is blocked until the checks finish." },
  ready: { tone: "success", text: "Ready to merge: all checks passed, no conflicts with main." },
  merged: { tone: "accent", text: "Pull request merged into main." },
  deleted: { tone: "accent", text: "Merged, and the branch was deleted." },
};

const CHECK_LABELS = { passed: "passed", running: "in progress", queued: "queued" };
const CHECK_TONES = { passed: "success", running: "warning", queued: "muted" };

function PullRequest({ pr, setup, fresh }) {
  const box = MERGE_BOX[pr.merge];
  return (
    <div className="pull-request-flow__pr">
      <div className="pull-request-flow__head">
        <p className="pull-request-flow__title">
          {setup.title} <span className="pull-request-flow__number">#{NUMBER}</span>
        </p>
        <p className="pull-request-flow__meta">
          <Chip tone={pr.state === "merged" ? "accent" : "success"}>
            {pr.state === "merged" ? "Merged" : "Open"}
          </Chip>
          <span>
            You {pr.state === "merged" ? "merged" : "want to merge"} {pr.commits} commit
            {pr.commits === 1 ? "" : "s"} into <code>main</code> from <code>{setup.branch}</code>
          </span>
        </p>
      </div>
      <ol className="pull-request-flow__timeline" aria-label="Conversation">
        {pr.timeline.map((item) => (
          <li
            key={item.kind}
            className={[
              "pull-request-flow__event",
              `pull-request-flow__event--${item.kind}`,
              item.kind === fresh && "is-new",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span>{item.text}</span>
            {item.quote && <q className="pull-request-flow__quote">{item.quote}</q>}
          </li>
        ))}
      </ol>
      {pr.checks && (
        <div
          className={
            fresh === "checks" ? "pull-request-flow__checks is-new" : "pull-request-flow__checks"
          }
        >
          <p className="pull-request-flow__label">Checks</p>
          <ul className="pull-request-flow__check-list" aria-label="Checks">
            {pr.checks.map((check) => (
              <li key={check.name} className="pull-request-flow__check">
                <span className="demo-mono">{check.name}</span>
                <Chip tone={CHECK_TONES[check.state]}>{CHECK_LABELS[check.state]}</Chip>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className={`pull-request-flow__merge pull-request-flow__merge--${box.tone}`}>{box.text}</p>
    </div>
  );
}

export default function PullRequestFlow({ props, step }) {
  const setup = settings(props);
  const stage = stageAt(build(setup), step);
  return (
    <div className="pull-request-flow">
      {stage.pr && <PullRequest pr={stage.pr} setup={setup} fresh={stage.fresh} />}
      {stage.run && (
        <Shell entries={stage.run.map((entry) => ({ ...entry, fresh: true }))} folder={REPO} />
      )}
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
