export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);

  return [
    {
      id: "browser-globals",
      title: "The console shows that window and document exist here",
      pass: has("typeof window: object") && has("typeof document: object"),
      hint: 'Log typeof window and typeof document with the labels "typeof window:" and "typeof document:".'
    },
    {
      id: "no-process",
      title: "The console shows that process does not exist here",
      pass: has("typeof process: undefined"),
      hint: 'Log typeof process with the label "typeof process:". In the browser it prints undefined, with no error.'
    },
    {
      id: "where-it-runs",
      title: "The file reports that it runs in a browser",
      pass: has("This file is running in a browser."),
      hint: "Choose the word with typeof window === \"undefined\" ? \"Node\" : \"a browser\" and log it in the template literal."
    }
  ];
}
