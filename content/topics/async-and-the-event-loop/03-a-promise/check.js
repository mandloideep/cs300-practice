export default async function check({ console, wait }) {
  const lines = () => console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  for (let i = 0; i < 60 && !lines().some((line) => line.startsWith("Still there later")); i++) await wait(50);

  const all = lines();
  const sent = all.indexOf("Request sent");
  const right = all.indexOf("Right away: [Promise]");
  const waiting = all.indexOf("Waiting for the course list...");
  const loaded = all.indexOf('Loaded: ["CS200","CS300","CS315"]');
  const loadedLine = all.find((line) => line.startsWith("Loaded:"));

  return [
    {
      id: "executor-runs-at-once",
      title: "The executor runs at once, and the call returns a pending promise",
      pass: sent !== -1 && right > sent,
      hint:
        right === -1
          ? 'Log "Right away:" with request, the value loadCourses returns; it should print [Promise]. If it prints undefined, loadCourses is missing its return.'
          : 'Log "Request sent" inside the executor, the function passed to new Promise.'
    },
    {
      id: "then-runs-later",
      title: "The then callback gets the courses after the script has finished",
      pass: waiting !== -1 && loaded > waiting,
      hint: loadedLine
        ? `The Loaded line reads "${loadedLine}". Resolve the promise with catalog, and log the courses the then callback receives.`
        : 'Call request.then with a callback that logs "Loaded:" and the courses, then log "Waiting for the course list..." on the next line.'
    },
    {
      id: "settles-once",
      title: "A then attached later still gets the same value",
      pass: all.includes("Still there later: 3 courses"),
      hint: "After 300 ms, call request.then again and log \"Still there later:\" with courses.length and \"courses\"."
    }
  ];
}
