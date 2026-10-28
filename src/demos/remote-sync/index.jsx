import { Caption, Chip, Panel, stageAt } from "../kit.jsx";
import { Shell } from "../three-trees/shell.jsx";
import "../three-trees/shell.css";
import "./styles.css";

export const id = "remote-sync";

export const defaults = { scenario: "push" };

const SCENARIOS = ["push", "pull", "rejected"];
const REPO = "study-plan";
const REMOTE = `https://github.com/you/${REPO}`;

const COMMITS = {
  "453dd0d": { text: "Initial page", parents: [] },
  "6134b4c": { text: "Add styles", parents: ["453dd0d"] },
  c0ac632: { text: "Add a footer", parents: ["6134b4c"], by: "you" },
  d4e8a21: { text: "Fix the title typo", parents: ["6134b4c"], by: "teammate" },
  e7f3b90: {
    text: `Merge branch 'main' of ${REMOTE}`,
    parents: ["c0ac632", "d4e8a21"],
    by: "you",
  },
};

const NEWEST_FIRST = ["e7f3b90", "d4e8a21", "c0ac632", "6134b4c", "453dd0d"];
const BASE = "6134b4c";
const YOURS = "c0ac632";
const THEIRS = "d4e8a21";
const MERGE = "e7f3b90";

const STAT = [" README.md | 2 +-", " 1 file changed, 1 insertion(+), 1 deletion(-)"];
const FETCHED = [`From ${REMOTE}`, `   ${BASE}..${THEIRS}  main       -> origin/main`];

function ancestors(hash) {
  const seen = new Set();
  const visit = (next) => {
    if (!next || seen.has(next)) return;
    seen.add(next);
    COMMITS[next].parents.forEach(visit);
  };
  visit(hash);
  return seen;
}

function counts(local) {
  const mine = ancestors(local.main);
  const tracked = ancestors(local.origin);
  return {
    ahead: [...mine].filter((hash) => !tracked.has(hash)).length,
    behind: [...tracked].filter((hash) => !mine.has(hash)).length,
  };
}

function plural(count) {
  return `${count} commit${count === 1 ? "" : "s"}`;
}

function status(local) {
  const { ahead, behind } = counts(local);
  const lines = ["On branch main"];
  if (ahead && behind) {
    lines.push(
      "Your branch and 'origin/main' have diverged,",
      `and have ${ahead} and ${behind} different commits each, respectively.`,
      '  (use "git pull" if you want to integrate the remote branch with yours)',
    );
  } else if (ahead) {
    lines.push(
      `Your branch is ahead of 'origin/main' by ${plural(ahead)}.`,
      '  (use "git push" to publish your local commits)',
    );
  } else if (behind) {
    lines.push(
      `Your branch is behind 'origin/main' by ${plural(behind)}, and can be fast-forwarded.`,
      '  (use "git pull" to update your local branch)',
    );
  } else {
    lines.push("Your branch is up to date with 'origin/main'.");
  }
  return [...lines, "", "nothing to commit, working tree clean"];
}

function pushed(from, to) {
  return [`To ${REMOTE}.git`, `   ${from}..${to}  main -> main`];
}

function stagesFor(scenario) {
  if (scenario === "pull") {
    const before = { main: BASE, origin: BASE };
    const fetched = { main: BASE, origin: THEIRS };
    const pulled = { main: THEIRS, origin: THEIRS };
    return [
      {
        local: before,
        remote: THEIRS,
        fresh: [THEIRS],
        run: [{ command: "git status", output: status(before) }],
        caption: `A teammate pushed ${THEIRS} to GitHub. Your computer has not asked GitHub since, so origin/main still points at ${BASE}, and git status says you are up to date: it only knows what the last fetch told it.`,
      },
      {
        local: fetched,
        remote: THEIRS,
        fresh: [THEIRS],
        run: [
          { command: "git fetch", output: FETCHED },
          { command: "git status", output: status(fetched) },
        ],
        caption: `git fetch downloads ${THEIRS} and moves origin/main to it. Your main and your files do not change. Now git status knows you are behind by one commit.`,
      },
      {
        local: pulled,
        remote: THEIRS,
        fresh: [THEIRS],
        run: [
          {
            command: "git pull",
            output: [`Updating ${BASE}..${THEIRS}`, "Fast-forward", ...STAT],
          },
        ],
        caption: `git pull is a fetch and then a merge of origin/main into main. You had no new commits of your own, so the merge is a fast-forward: main moves up to ${THEIRS}, and the teammate's change is in your files.`,
      },
      {
        local: pulled,
        remote: THEIRS,
        fresh: [],
        run: [{ command: "git status", output: status(pulled) }],
        caption:
          "Both histories match again, with nothing ahead and nothing behind. Pull before you start work each day, so that you build on what the team has already pushed.",
      },
    ];
  }

  if (scenario === "rejected") {
    const before = { main: YOURS, origin: BASE };
    const merged = { main: MERGE, origin: THEIRS };
    const done = { main: MERGE, origin: MERGE };
    return [
      {
        local: before,
        remote: THEIRS,
        fresh: [YOURS, THEIRS],
        run: [{ command: "git status", output: status(before) }],
        caption: `You committed ${YOURS}, and meanwhile a teammate pushed ${THEIRS} to GitHub. Both start from ${BASE}. git status says you are one commit ahead, because it has not seen the teammate's commit.`,
      },
      {
        local: before,
        remote: THEIRS,
        fresh: [],
        rejected: true,
        run: [
          {
            command: "git push",
            error: true,
            output: [
              `To ${REMOTE}.git`,
              " ! [rejected]        main -> main (fetch first)",
              `error: failed to push some refs to '${REMOTE}.git'`,
              "hint: Updates were rejected because the remote contains work that you do not",
              "hint: have locally. This is usually caused by another repository pushing to",
              "hint: the same ref. If you want to integrate the remote changes, use",
              "hint: 'git pull' before pushing again.",
              "hint: See the 'Note about fast-forwards' in 'git push --help' for details.",
            ],
          },
        ],
        caption: `GitHub refuses the push. Moving its main to ${YOURS} would drop ${THEIRS}, which is not in your history, so nothing changes on either side. Never answer this with git push --force, which would delete the teammate's commit.`,
      },
      {
        local: merged,
        remote: THEIRS,
        fresh: [THEIRS, MERGE],
        run: [
          {
            command: "git pull",
            output: [...FETCHED, "Merge made by the 'ort' strategy.", ...STAT],
          },
          { command: "git status", output: status(merged) },
        ],
        caption: `git pull fetches ${THEIRS} and merges it with your work in a merge commit, ${MERGE}, whose parents are ${YOURS} and ${THEIRS}. If both of you had changed the same lines, the merge would stop with a conflict to resolve first. You are now two commits ahead and nothing behind.`,
      },
      {
        local: done,
        remote: MERGE,
        fresh: [YOURS, MERGE],
        run: [{ command: "git push", output: pushed(THEIRS, MERGE) }],
        caption: `This push only adds commits on top of what GitHub has, so it is accepted: GitHub gains ${YOURS} and ${MERGE}, and both histories match with nothing lost.`,
      },
    ];
  }

  const start = { main: BASE, origin: BASE };
  const ahead = { main: YOURS, origin: BASE };
  const done = { main: YOURS, origin: YOURS };
  return [
    {
      local: start,
      remote: BASE,
      fresh: [],
      run: [{ command: "git status", output: status(start) }],
      caption: `Your computer and GitHub hold the same history, ending at ${BASE}. origin/main is your computer's record of where main is on GitHub.`,
    },
    {
      local: ahead,
      remote: BASE,
      fresh: [YOURS],
      run: [
        {
          command: `git commit -am "${COMMITS[YOURS].text}"`,
          output: [`[main ${YOURS}] ${COMMITS[YOURS].text}`, " 1 file changed, 4 insertions(+)"],
        },
        { command: "git status", output: status(ahead) },
      ],
      caption: `You commit ${YOURS}. It exists only on your computer: main moves, origin/main does not, and git status says you are one commit ahead.`,
    },
    {
      local: done,
      remote: YOURS,
      fresh: [YOURS],
      run: [{ command: "git push", output: pushed(BASE, YOURS) }],
      caption: `git push sends ${YOURS} to GitHub and moves GitHub's main to it. Your computer moves origin/main too, since it now knows where main is there.`,
    },
    {
      local: done,
      remote: YOURS,
      fresh: [],
      run: [{ command: "git status", output: status(done) }],
      caption:
        "git status says you are up to date: nothing ahead and nothing behind. Your teammates get the commit the next time they pull.",
    },
  ];
}

function settings(props) {
  return SCENARIOS.includes(props.scenario) ? props.scenario : defaults.scenario;
}

export function stepCount(props) {
  return stagesFor(settings(props)).length;
}

function History({ title, hashes, pointers, fresh, dashed = [], label }) {
  return (
    <Panel title={title} className="remote-sync__side">
      <ol className="remote-sync__commits" aria-label={label}>
        {hashes.map((hash) => {
          const commit = COMMITS[hash];
          const names = pointers.filter((pointer) => pointer.hash === hash);
          const classes = [
            "remote-sync__commit",
            fresh.includes(hash) && `is-new remote-sync__commit--${commit.by ?? "you"}`,
            dashed.includes(hash) && "is-fetched",
          ].filter(Boolean);
          return (
            <li key={hash} className={classes.join(" ")}>
              <span className="remote-sync__hash">{hash}</span>
              <span className="remote-sync__text">{commit.text}</span>
              {commit.by && <span className="remote-sync__by">by {commit.by}</span>}
              {dashed.includes(hash) && (
                <span className="visually-hidden">, fetched but not in main</span>
              )}
              {names.length > 0 && (
                <span className="remote-sync__pointers">
                  {names.map((pointer) => (
                    <Chip key={pointer.name} tone={pointer.tone}>
                      {pointer.name}
                    </Chip>
                  ))}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}

export default function RemoteSync({ props, step }) {
  const stage = stageAt(stagesFor(settings(props)), step);
  const mine = ancestors(stage.local.main);
  const tracked = ancestors(stage.local.origin);
  const localHashes = NEWEST_FIRST.filter((hash) => mine.has(hash) || tracked.has(hash));
  const remoteHashes = NEWEST_FIRST.filter((hash) => ancestors(stage.remote).has(hash));
  const { ahead, behind } = counts(stage.local);

  return (
    <div className="remote-sync">
      <div className="remote-sync__sides">
        <History
          title="Your computer"
          label="Commits on your computer, newest first"
          hashes={localHashes}
          fresh={stage.fresh}
          dashed={localHashes.filter((hash) => !mine.has(hash))}
          pointers={[
            { name: "HEAD → main", hash: stage.local.main, tone: "accent" },
            { name: "origin/main", hash: stage.local.origin, tone: "muted" },
          ]}
        />
        <History
          title="GitHub (origin)"
          label="Commits on GitHub, newest first"
          hashes={remoteHashes}
          fresh={stage.fresh}
          pointers={[
            {
              name: "main",
              hash: stage.remote,
              tone: stage.rejected ? "danger" : "success",
            },
          ]}
        />
      </div>
      <p className="remote-sync__counts">
        <span>main compared with origin/main:</span>
        <span className="remote-sync__count-chips">
          <Chip tone={ahead ? "accent" : "muted"}>ahead {ahead}</Chip>
          <Chip tone={behind ? "warning" : "muted"}>behind {behind}</Chip>
        </span>
      </p>
      <Shell entries={stage.run.map((entry) => ({ ...entry, fresh: true }))} folder={REPO} />
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
