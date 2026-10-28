// A terminal transcript for the Git explainers: each entry is a command and the lines it printed,
// drawn the way the student's own terminal draws them, with the newest entry marked. An entry
// with `graph` set is git log --graph output, whose wrapped lines hang past the graph.

export function Shell({ entries, label = "Terminal", folder = "my-project" }) {
  return (
    <div className="git-shell">
      <p className="git-shell__bar" aria-hidden="true">
        {label}: {folder}
      </p>
      <ol className="git-shell__session" aria-label={label}>
        {entries.map((entry, index) => (
          <li key={index} className={entry.fresh ? "git-shell__entry is-new" : "git-shell__entry"}>
            {entry.command ? (
              <p className="git-shell__line">
                <span className="git-shell__prompt">
                  {folder}
                  <span aria-hidden="true"> $</span>
                </span>{" "}
                <span className="git-shell__command">{entry.command}</span>
              </p>
            ) : (
              <p className="git-shell__line git-shell__note">{entry.note}</p>
            )}
            {entry.output?.length > 0 && (
              <samp className={entry.error ? "git-shell__output is-error" : "git-shell__output"}>
                {entry.output.map((line, row) => {
                  const text = line.replace(/\t/g, "        ");
                  const indent = /^ */.exec(text)[0].length;
                  const hang = entry.graph ? /^[*|\\/ ]*/.exec(text)[0].length - indent : 0;
                  return (
                    <span
                      key={row}
                      className="git-shell__out-line"
                      style={
                        indent + hang > 0
                          ? { "--git-indent": `${indent}ch`, "--git-hang": `${hang}ch` }
                          : undefined
                      }
                    >
                      {text.trim() === "" ? " " : text.slice(indent)}
                    </span>
                  );
                })}
              </samp>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
