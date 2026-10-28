import { Caption, Chip, stageAt } from "../kit.jsx";
import { Shell } from "../three-trees/shell.jsx";
import "../three-trees/shell.css";
import "./styles.css";

export const id = "branch-and-merge";

export const defaults = {
  main: ["Initial page", "Add styles"],
  branch: { name: "cart", commits: ["Add the cart"] },
  mainMovesAfterBranch: false,
  mainCommit: "Fix a typo in the footer",
};

const BRANCH = /^(?!main$)[a-z0-9][a-z0-9._/-]{0,19}$/;

function message(value) {
  return typeof value === "string" && value.trim() !== "" && value.trim().length <= 50
    ? value.trim()
    : null;
}

function messages(value, max) {
  if (!Array.isArray(value)) return null;
  const list = value.map(message);
  return list.length >= 1 && list.length <= max && list.every(Boolean) ? list : null;
}

function hashOf(text) {
  let value = 0x811c9dc5;
  for (const char of text) {
    value ^= char.codePointAt(0);
    value = Math.imul(value, 0x01000193) >>> 0;
  }
  return value.toString(16).padStart(8, "0").slice(0, 7);
}

function settings(props) {
  const main = messages(props.main, 4) ?? defaults.main;
  const branch = props.branch && typeof props.branch === "object" ? props.branch : {};
  const name =
    typeof branch.name === "string" && BRANCH.test(branch.name)
      ? branch.name
      : defaults.branch.name;
  const work = messages(branch.commits, 3) ?? defaults.branch.commits;
  const moves =
    typeof props.mainMovesAfterBranch === "boolean"
      ? props.mainMovesAfterBranch
      : defaults.mainMovesAfterBranch;
  const fix = message(props.mainCommit) ?? defaults.mainCommit;
  return { main, name, work, moves, fix };
}

function commitsOf({ main, name, work, fix }) {
  const make = (text, index, parents) => ({ text, hash: hashOf(`${index}:${text}`), parents });
  const base = [];
  main.forEach((text, index) => base.push(make(text, index, index ? [base[index - 1].hash] : [])));
  const tip = base[base.length - 1];
  const side = [];
  work.forEach((text, index) =>
    side.push(make(text, 10 + index, [index ? side[index - 1].hash : tip.hash])),
  );
  const fixCommit = make(fix, 20, [tip.hash]);
  const merge = make(`Merge branch '${name}'`, 30, [fixCommit.hash, side[side.length - 1].hash]);
  return { base, side, fixCommit, merge };
}

function build(setup) {
  const { name, moves } = setup;
  const { base, side, fixCommit, merge } = commitsOf(setup);
  const tip = base[base.length - 1];
  const sideTip = side[side.length - 1];
  const lane = (list, value) => list.map((commit) => ({ ...commit, lane: value }));
  const stages = [];

  const graph = (rows, pointers, head, fresh = []) => ({ rows, pointers, head, fresh });
  const forked = (count) => [
    ...lane(side.slice(0, count), 1).reverse(),
    ...lane(base, 0).reverse(),
  ];

  stages.push({
    ...graph(lane(base, 0).reverse(), { main: tip.hash }, "main"),
    run: {
      command: "git log --oneline",
      output: [...base].reverse().map((commit) => decorate(commit, null, name, tip.hash)),
    },
    caption: `main is a branch, and a branch is only a name that points at one commit, here ${tip.hash}. HEAD says which branch you are on: main.`,
  });
  stages.push({
    ...graph(lane(base, 0).reverse(), { main: tip.hash, [name]: tip.hash }, "main"),
    run: { command: `git branch ${name}`, output: [] },
    caption: `git branch ${name} makes a second name that points at the same commit. No files are copied, and HEAD stays on main.`,
  });
  stages.push({
    ...graph(lane(base, 0).reverse(), { main: tip.hash, [name]: tip.hash }, name),
    run: { command: `git switch ${name}`, output: [`Switched to branch '${name}'`] },
    caption: `git switch ${name} moves HEAD to ${name}. The files do not change, because both branches point at the same commit.`,
  });
  side.forEach((commit, index) => {
    stages.push({
      ...graph(forked(index + 1), { main: tip.hash, [name]: commit.hash }, name, [commit.hash]),
      run: {
        command: `git commit -m "${commit.text}"`,
        output: [`[${name} ${commit.hash}] ${commit.text}`],
      },
      caption:
        index === 0
          ? `You commit on ${name}. The new commit's parent is ${tip.hash}, and ${name} moves forward to ${commit.hash} because HEAD is on it. main does not move.`
          : `Another commit on ${name}: ${name} moves to ${commit.hash}, and main still points at ${tip.hash}.`,
    });
  });
  const branched = forked(side.length);
  stages.push({
    ...graph(branched, { main: tip.hash, [name]: sideTip.hash }, "main"),
    run: { command: "git switch main", output: ["Switched to branch 'main'"] },
    caption: `git switch main moves HEAD back to main, and the files in the folder go back to ${tip.hash}: the work on ${name} is safe in its own commits.`,
  });

  if (moves) {
    const diverged = [
      ...lane(side, 1).reverse(),
      { ...fixCommit, lane: 0 },
      ...lane(base, 0).reverse(),
    ];
    stages.push({
      ...graph(diverged, { main: fixCommit.hash, [name]: sideTip.hash }, "main", [fixCommit.hash]),
      run: {
        command: `git commit -m "${fixCommit.text}"`,
        output: [`[main ${fixCommit.hash}] ${fixCommit.text}`],
      },
      caption: `Someone commits on main too, so main moves to ${fixCommit.hash}. The two branches have diverged: each has a commit the other lacks.`,
    });
    const merged = [{ ...merge, lane: 0 }, ...diverged];
    stages.push({
      ...graph(merged, { main: merge.hash, [name]: sideTip.hash }, "main", [merge.hash]),
      run: { command: `git merge ${name}`, output: ["Merge made by the 'ort' strategy."] },
      caption: `main cannot just move forward, because ${sideTip.hash} is not ahead of ${fixCommit.hash}. git merge makes a merge commit, ${merge.hash}, with two parents, one from each branch, and moves main to it.`,
    });
    stages.push({
      ...graph(merged, { main: merge.hash, [name]: sideTip.hash }, "main"),
      run: {
        command: "git log --oneline --graph",
        graph: true,
        output: mergedGraph({ merge, side, fixCommit, base, name, sideTip }),
      },
      caption: `git log --graph draws the same picture in text: the two lines that split at ${tip.hash} and join again at the merge commit.`,
    });
  } else {
    const straight = lane([...base, ...side], 0).reverse();
    stages.push({
      ...graph(straight, { main: sideTip.hash, [name]: sideTip.hash }, "main", [sideTip.hash]),
      run: {
        command: `git merge ${name}`,
        output: [`Updating ${tip.hash}..${sideTip.hash}`, "Fast-forward"],
      },
      caption: `main has not moved since ${name} began, so ${name} is simply ahead of it. git merge does a fast-forward: main slides up to ${sideTip.hash}. No new commit is made, and the history stays one straight line.`,
    });
    stages.push({
      ...graph(straight, { main: sideTip.hash, [name]: sideTip.hash }, "main"),
      run: {
        command: "git log --oneline --graph",
        graph: true,
        output: straight.map((commit) => `* ${decorate(commit, sideTip, name)}`),
      },
      caption: `git log --graph draws one line of commits, with main and ${name} on the same one. Had main moved after the branch began, the merge would have made a merge commit instead.`,
    });
  }
  return stages;
}

function oneline(commit) {
  return `${commit.hash} ${commit.text}`;
}

function decorate(commit, sideTip, name, mainHash = sideTip?.hash) {
  const names = [];
  if (commit.hash === mainHash) names.push("HEAD -> main");
  if (commit.hash === sideTip?.hash) names.push(name);
  return names.length ? `${commit.hash} (${names.join(", ")}) ${commit.text}` : oneline(commit);
}

function mergedGraph({ merge, side, fixCommit, base, name, sideTip }) {
  const label = (commit) => decorate(commit, sideTip, name, merge.hash);
  return [
    `*   ${label(merge)}`,
    "|\\",
    ...[...side].reverse().map((commit) => `| * ${label(commit)}`),
    `* | ${label(fixCommit)}`,
    "|/",
    ...[...base].reverse().map((commit) => `* ${label(commit)}`),
  ];
}

export function stepCount(props) {
  return build(settings(props)).length;
}

function segments(rows) {
  const index = new Map(rows.map((commit, row) => [commit.hash, row]));
  const parts = rows.map(() => []);
  rows.forEach((child, a) => {
    for (const parentHash of child.parents) {
      const b = index.get(parentHash);
      if (b === undefined) continue;
      const from = child.lane;
      const to = rows[b].lane;
      const side = Math.max(from, to);
      if (from === to) {
        parts[a].push({ lane: from, kind: "down" });
        for (let row = a + 1; row < b; row += 1) parts[row].push({ lane: from, kind: "through" });
        parts[b].push({ lane: to, kind: "up" });
      } else if (from < to) {
        parts[a].push({ lane: side, kind: "merge", from, to });
        for (let row = a + 1; row < b; row += 1) parts[row].push({ lane: side, kind: "through" });
        parts[b].push({ lane: to, kind: "up" });
      } else {
        parts[a].push({ lane: from, kind: "down" });
        for (let row = a + 1; row < b; row += 1) parts[row].push({ lane: side, kind: "through" });
        parts[b].push({ lane: side, kind: "fork", from, to });
      }
    }
  });
  return parts;
}

const X = (lane) => 10 + lane * 20;

function Lanes({ parts, lanes }) {
  return (
    <svg
      className="branch-and-merge__lanes"
      viewBox={`0 0 ${lanes * 20} 40`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {parts.map((part, index) => {
        const tone = `branch-and-merge__edge--${part.lane}`;
        if (part.kind === "down") {
          return (
            <line
              key={index}
              className={tone}
              x1={X(part.lane)}
              y1="20"
              x2={X(part.lane)}
              y2="40"
            />
          );
        }
        if (part.kind === "up") {
          return (
            <line key={index} className={tone} x1={X(part.lane)} y1="0" x2={X(part.lane)} y2="20" />
          );
        }
        if (part.kind === "through") {
          return (
            <line key={index} className={tone} x1={X(part.lane)} y1="0" x2={X(part.lane)} y2="40" />
          );
        }
        if (part.kind === "merge") {
          return (
            <line key={index} className={tone} x1={X(part.from)} y1="20" x2={X(part.to)} y2="40" />
          );
        }
        return (
          <line key={index} className={tone} x1={X(part.from)} y1="0" x2={X(part.to)} y2="20" />
        );
      })}
    </svg>
  );
}

function Graph({ stage, name }) {
  const parts = segments(stage.rows);
  const lanes = stage.rows.some((commit) => commit.lane === 1) ? 2 : 1;
  const byHash = new Map(stage.rows.map((commit) => [commit.hash, commit]));
  return (
    <ol className="branch-and-merge__graph" aria-label="Commits, newest first">
      {stage.rows.map((commit, row) => {
        const names = Object.entries(stage.pointers)
          .filter(([, hash]) => hash === commit.hash)
          .map(([branch]) => branch)
          .sort((a, b) => (a === "main" ? -1 : b === "main" ? 1 : 0));
        const fresh = stage.fresh.includes(commit.hash);
        const parents = commit.parents.filter((hash) => byHash.has(hash));
        return (
          <li
            key={commit.hash}
            className={fresh ? "branch-and-merge__row is-new" : "branch-and-merge__row"}
            style={{ "--lanes": lanes }}
          >
            <span className="branch-and-merge__track">
              <Lanes parts={parts[row]} lanes={lanes} />
              <span
                className={`branch-and-merge__dot branch-and-merge__dot--${commit.lane}`}
                style={{ "--lane": commit.lane }}
                aria-hidden="true"
              />
            </span>
            <span className="branch-and-merge__label">
              <span className="branch-and-merge__hash">{commit.hash}</span>{" "}
              <span className="branch-and-merge__text">{commit.text}</span>
              <span className="visually-hidden">
                {parents.length === 0
                  ? ", no parent"
                  : parents.length === 1
                    ? `, parent ${parents[0]}`
                    : `, parents ${parents[0]} and ${parents[1]}`}
              </span>
              {names.length > 0 && (
                <span className="branch-and-merge__pointers">
                  {names.map((branch) => (
                    <Chip
                      key={branch}
                      tone={branch === stage.head ? "accent" : undefined}
                      className={branch === name ? "branch-and-merge__pointer--side" : undefined}
                    >
                      {branch === stage.head ? `HEAD → ${branch}` : branch}
                    </Chip>
                  ))}
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export default function BranchAndMerge({ props, step }) {
  const setup = settings(props);
  const stage = stageAt(build(setup), step);
  return (
    <div className="branch-and-merge">
      <Graph stage={stage} name={setup.name} />
      <Shell entries={[{ ...stage.run, fresh: true }]} />
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
