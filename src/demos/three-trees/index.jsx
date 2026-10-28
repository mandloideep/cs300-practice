import { Caption, Chip, Panel, stageAt } from "../kit.jsx";
import { Shell } from "./shell.jsx";
import "./shell.css";
import "./styles.css";

export const id = "three-trees";

export const defaults = { file: "App.jsx" };

const FILE = /^(?!.*\.\.)[\w.-]+(\/[\w.-]+){0,3}$/;

const VERSIONS = {
  jsx: ["<h1>Shop</h1>", "<h1>The Shop</h1>", "<h1>The Shop (test)</h1>"],
  js: ['const title = "Shop";', 'const title = "The Shop";', 'const title = "The Shop (test)";'],
  css: ["h1 { color: black; }", "h1 { color: navy; }", "h1 { color: red; }"],
  html: ["<title>Shop</title>", "<title>The Shop</title>", "<title>The Shop (test)</title>"],
  text: ["# Shop", "# The Shop", "# The Shop (test)"],
};

const KINDS = { tsx: "jsx", ts: "js", mjs: "js", cjs: "js", htm: "html" };

const FIRST = { hash: "a1b2c3d", message: "Initial page" };
const SECOND = { hash: "9f4e2b7", message: "Rename the heading" };

function settings(props) {
  const file =
    typeof props.file === "string" && props.file.length <= 40 && FILE.test(props.file)
      ? props.file
      : defaults.file;
  const extension = /\.(\w+)$/.exec(file)?.[1] ?? "";
  const kind = KINDS[extension] ?? extension;
  return { file, lines: VERSIONS[kind] ?? VERSIONS.text };
}

function status(file, { staged, unstaged }) {
  const lines = ["On branch main"];
  if (!staged && !unstaged) return [...lines, "nothing to commit, working tree clean"];
  if (staged) {
    lines.push(
      "Changes to be committed:",
      '  (use "git restore --staged <file>..." to unstage)',
      `\tmodified:   ${file}`,
      "",
    );
  }
  if (unstaged) {
    lines.push(
      "Changes not staged for commit:",
      '  (use "git add <file>..." to update what will be committed)',
      '  (use "git restore <file>..." to discard changes in working directory)',
      `\tmodified:   ${file}`,
      "",
    );
  }
  if (!staged) lines.push('no changes added to commit (use "git add" and/or "git commit -a")');
  return lines[lines.length - 1] === "" ? lines.slice(0, -1) : lines;
}

function stages({ file }) {
  return [
    {
      versions: [0, 0, 0],
      commits: [FIRST],
      run: [],
      caption: `All three places hold the same ${file}: the working tree is the folder you edit, the staging area holds what the next commit will record, and the repository holds every commit so far. git status says there is nothing to commit.`,
    },
    {
      versions: [1, 0, 0],
      commits: [FIRST],
      saved: "You change the heading and save.",
      run: [],
      caption: `You edit ${file} and save. Only the working tree changes. git status lists it under "Changes not staged for commit": Git sees the change but will not record it until you add it.`,
    },
    {
      versions: [1, 1, 0],
      commits: [FIRST],
      run: [{ command: `git add ${file}`, output: [] }],
      caption: `git add copies the file as it is now into the staging area. git status moves it to "Changes to be committed". The repository still holds only the first commit.`,
    },
    {
      versions: [2, 1, 0],
      commits: [FIRST],
      saved: "You try another heading and save.",
      run: [],
      caption: `You edit the same line again. The staging area kept the copy you added, so ${file} now appears in both sections of git status: a commit now would record the staged copy, not this experiment.`,
    },
    {
      versions: [1, 1, 0],
      commits: [FIRST],
      run: [{ command: `git restore ${file}`, output: [] }],
      caption: `git restore copies the staged ${file} back over the working tree, so the experiment is gone and cannot be brought back. git restore --staged would do the opposite: copy the repository's version into the staging area.`,
    },
    {
      versions: [1, 1, 1],
      commits: [FIRST, SECOND],
      run: [
        {
          command: `git commit -m "${SECOND.message}"`,
          output: [
            `[main ${SECOND.hash}] ${SECOND.message}`,
            " 1 file changed, 1 insertion(+), 1 deletion(-)",
          ],
        },
      ],
      caption: `git commit records the staging area as a new commit, ${SECOND.hash}, after ${FIRST.hash}. All three places agree again and git status is clean. Reset puts the file back where it started.`,
    },
  ];
}

export function stepCount() {
  return 6;
}

const PLACES = [
  { name: "Working tree", note: "the files you edit" },
  { name: "Staging area", note: "the next commit" },
  { name: "Repository", note: "every commit" },
];

function Place({ place, index, file, line, changed, children }) {
  return (
    <Panel title={place.name} className="three-trees__place">
      <p className="three-trees__note">{place.note}</p>
      <div className={changed ? "three-trees__file is-changed" : "three-trees__file"}>
        <span className="three-trees__name">
          {file}
          {changed && <Chip tone="accent">{index === 2 ? "new commit" : "changed"}</Chip>}
        </span>
        <code className="three-trees__line">{line}</code>
      </div>
      {children}
    </Panel>
  );
}

export default function ThreeTrees({ props, step }) {
  const setup = settings(props);
  const all = stages(setup);
  const stage = stageAt(all, step);
  const previous = step > 0 ? stageAt(all, step - 1) : stage;
  const [working, staged, committed] = stage.versions;
  const entries = [
    ...(stage.saved ? [{ note: stage.saved }] : []),
    ...stage.run,
    {
      command: "git status",
      output: status(setup.file, { staged: staged !== committed, unstaged: working !== staged }),
    },
  ].map((entry) => ({ ...entry, fresh: true }));

  return (
    <div className="three-trees">
      <div className="three-trees__places">
        {PLACES.map((place, index) => (
          <Place
            key={place.name}
            place={place}
            index={index}
            file={setup.file}
            line={setup.lines[stage.versions[index]]}
            changed={stage.versions[index] !== previous.versions[index]}
          >
            {index === 2 && (
              <ol className="three-trees__commits" aria-label="Commits">
                {stage.commits.map((commit) => (
                  <li key={commit.hash}>
                    <span className="demo-mono">{commit.hash}</span> {commit.message}
                  </li>
                ))}
              </ol>
            )}
          </Place>
        ))}
      </div>
      <Shell entries={entries} />
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
