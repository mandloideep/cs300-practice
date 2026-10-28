import { useState } from "react";
import { Caption, Choice, Panel, stageAt } from "../kit.jsx";
import { Shell } from "../three-trees/shell.jsx";
import "../three-trees/shell.css";
import "./styles.css";

export const id = "merge-conflict";

export const defaults = {
  file: "src/App.jsx",
  base: ["<h1>Shop</h1>"],
  ours: ["<h1>The Shop</h1>"],
  theirs: ["<h1>Shop</h1>", "<p>Open daily</p>"],
  branch: "hours",
  resolved: ["<h1>The Shop</h1>", "<p>Open daily</p>"],
};

const FILE = /^(?!.*\.\.)[\w.-]+(\/[\w.-]+){0,3}$/;
const BRANCH = /^(?!main$)[a-z0-9][a-z0-9._/-]{0,19}$/;
const MERGE_HASH = "4d5e6f7";

function lines(value) {
  return Array.isArray(value) &&
    value.length >= 1 &&
    value.length <= 6 &&
    value.every((line) => typeof line === "string" && line.length <= 60)
    ? value
    : null;
}

function same(a, b) {
  return a.length === b.length && a.every((line, index) => line === b[index]);
}

function combine(base, ours, theirs) {
  const result = [...ours];
  theirs.forEach((line, index) => {
    if (!base.includes(line) && !ours.includes(line)) {
      result.splice(Math.min(index, result.length), 0, line);
    }
  });
  return result;
}

function settings(props) {
  const base = lines(props.base);
  const ours = lines(props.ours);
  const theirs = lines(props.theirs);
  const given = base && ours && theirs && !same(ours, theirs);
  const pick = given ? { base, ours, theirs } : defaults;
  const file =
    typeof props.file === "string" && props.file.length <= 40 && FILE.test(props.file)
      ? props.file
      : defaults.file;
  const branch =
    typeof props.branch === "string" && BRANCH.test(props.branch) ? props.branch : defaults.branch;
  const resolved =
    (given ? lines(props.resolved) : defaults.resolved) ??
    combine(pick.base, pick.ours, pick.theirs);
  return { file, branch, base: pick.base, ours: pick.ours, theirs: pick.theirs, resolved };
}

function conflict({ ours, theirs }) {
  let start = 0;
  while (start < ours.length && start < theirs.length && ours[start] === theirs[start]) start += 1;
  let end = 0;
  while (
    end < ours.length - start &&
    end < theirs.length - start &&
    ours[ours.length - 1 - end] === theirs[theirs.length - 1 - end]
  ) {
    end += 1;
  }
  return {
    before: ours.slice(0, start),
    ours: ours.slice(start, ours.length - end),
    theirs: theirs.slice(start, theirs.length - end),
    after: ours.slice(ours.length - end),
  };
}

function marked(setup) {
  const parts = conflict(setup);
  return [
    ...parts.before.map((text) => ({ text, kind: "plain" })),
    { text: "<<<<<<< HEAD", kind: "marker" },
    ...parts.ours.map((text) => ({ text, kind: "ours" })),
    { text: "=======", kind: "marker" },
    ...parts.theirs.map((text) => ({ text, kind: "theirs" })),
    { text: `>>>>>>> ${setup.branch}`, kind: "marker" },
    ...parts.after.map((text) => ({ text, kind: "plain" })),
  ];
}

function options(setup) {
  const parts = conflict(setup);
  const both = [...parts.before, ...parts.ours, ...parts.theirs, ...parts.after];
  const list = [
    { value: "ours", label: "Keep ours", result: setup.ours },
    { value: "theirs", label: "Keep theirs", result: setup.theirs },
    { value: "both", label: "Keep both", result: both },
  ];
  if (![setup.ours, setup.theirs, both].some((result) => same(result, setup.resolved))) {
    list.push({ value: "hand", label: "Combine by hand", result: setup.resolved });
  }
  return list;
}

function choiceCaption(value, setup) {
  const { branch } = setup;
  if (value === "ours") {
    return `Keeping ours takes main's lines and drops what the ${branch} branch changed there. The markers are gone and the file runs, but that work is lost.`;
  }
  if (value === "theirs") {
    return `Keeping theirs takes the lines from ${branch} and drops main's change. The markers are gone, but main's work on these lines is lost.`;
  }
  if (value === "both") {
    return `Keeping both puts main's lines first and the lines from ${branch} after them. Nothing is lost, but a line both sides kept can now appear twice, so read the result before you commit it.`;
  }
  return `Combining by hand keeps each change once, main's and the one from ${branch}, with no markers left. This is usually what the merge should say.`;
}

export function stepCount() {
  return 6;
}

const STATUS = (file) => [
  "On branch main",
  "You have unmerged paths.",
  '  (fix conflicts and run "git commit")',
  '  (use "git merge --abort" to abort the merge)',
  "",
  "Unmerged paths:",
  '  (use "git add <file>..." to mark resolution)',
  `\tboth modified:   ${file}`,
  "",
  'no changes added to commit (use "git add" and/or "git commit -a")',
];

function FileLines({ rows, label }) {
  return (
    <pre className="merge-conflict__file" aria-label={label}>
      <code>
        {rows.map((row, index) => {
          const indent = /^ */.exec(row.text)[0].length;
          return (
            <span
              key={index}
              className={`merge-conflict__line is-${row.kind}`}
              style={indent > 0 ? { "--line-indent": `${indent}ch` } : undefined}
            >
              {row.text.trim() === "" ? " " : row.text.slice(indent)}
            </span>
          );
        })}
      </code>
    </pre>
  );
}

function plain(list, changed = []) {
  return list.map((text) => ({ text, kind: changed.includes(text) ? "changed" : "plain" }));
}

function sourced(list, setup) {
  const parts = conflict(setup);
  return list.map((text) => ({
    text,
    kind: parts.ours.includes(text) ? "ours" : parts.theirs.includes(text) ? "theirs" : "plain",
  }));
}

function Version({ title, rows, label }) {
  return (
    <Panel title={title} className="merge-conflict__panel">
      <FileLines rows={rows} label={label} />
    </Panel>
  );
}

export default function MergeConflict({ props, step }) {
  const setup = settings(props);
  const choices = options(setup);
  const [choice, setChoice] = useState(choices[choices.length - 1].value);
  const picked = choices.find((option) => option.value === choice) ?? choices[0];
  const current = Math.max(0, Math.min(5, step));
  const { file, branch, base, ours, theirs } = setup;
  const oursChanged = ours.filter((line) => !base.includes(line));
  const theirsChanged = theirs.filter((line) => !base.includes(line));
  const sides = (
    <div className="merge-conflict__sides">
      <Version title={`main: ${file}`} rows={plain(ours, oursChanged)} label={`${file} on main`} />
      <Version
        title={`${branch}: ${file}`}
        rows={plain(theirs, theirsChanged)}
        label={`${file} on ${branch}`}
      />
    </div>
  );

  const stages = [
    {
      body: <Version title={`${file} before the branches split`} rows={plain(base)} label={file} />,
      caption: `Both branches start from the same commit, where ${file} holds these lines. You make a branch called ${branch} from main.`,
    },
    {
      body: sides,
      caption: `Each branch then changes the same lines in its own way and commits. main and ${branch} now disagree about what those lines should say.`,
    },
    {
      body: (
        <>
          {sides}
          <Shell
            entries={[
              {
                command: `git merge ${branch}`,
                output: [
                  `Auto-merging ${file}`,
                  `CONFLICT (content): Merge conflict in ${file}`,
                  "Automatic merge failed; fix conflicts and then commit the result.",
                ],
                error: true,
                fresh: true,
              },
            ]}
          />
        </>
      ),
      caption: `On main you run git merge ${branch}. Git can combine changes to different lines on its own, but both sides changed these lines, and Git will not guess which one you meant. The merge stops.`,
    },
    {
      body: (
        <>
          <Version title={file} rows={marked(setup)} label={`${file} with conflict markers`} />
          <Shell entries={[{ command: "git status", output: STATUS(file), fresh: true }]} />
        </>
      ),
      caption: `Git writes both versions into ${file} between markers: <<<<<<< HEAD starts main's lines, ======= separates them from the lines of ${branch}, and >>>>>>> ${branch} ends them. git status lists the file as both modified until you fix it.`,
    },
    {
      body: (
        <>
          <Choice
            legend="Resolve the conflict"
            options={choices.map(({ value, label }) => ({ value, label }))}
            value={picked.value}
            onChange={setChoice}
          />
          <Version
            title={`${file}, resolved`}
            rows={sourced(picked.result, setup)}
            label={`${file} resolved by ${picked.label.toLowerCase()}`}
          />
        </>
      ),
      caption: choiceCaption(picked.value, setup),
    },
    {
      body: (
        <>
          <Choice
            legend="Resolve the conflict"
            options={choices.map(({ value, label }) => ({ value, label }))}
            value={picked.value}
            onChange={setChoice}
          />
          <Version
            title={`${file}, resolved`}
            rows={sourced(picked.result, setup)}
            label={`${file} resolved by ${picked.label.toLowerCase()}`}
          />
          <Shell
            entries={[
              { command: `git add ${file}`, output: [], fresh: true },
              {
                command: "git commit --no-edit",
                output: [`[main ${MERGE_HASH}] Merge branch '${branch}'`],
                fresh: true,
              },
            ]}
          />
        </>
      ),
      caption: `git add marks ${file} as resolved, and git commit finishes the merge with a merge commit, ${MERGE_HASH}, whose two parents are the tips of main and ${branch}. Whatever the file holds now is what main holds.`,
    },
  ];
  const stage = stageAt(stages, current);

  return (
    <div className="merge-conflict">
      {stage.body}
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
