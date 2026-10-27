export default async function check({ console, wait }) {
  const at = (level) => console.filter((entry) => entry.level === level).map((entry) => entry.text);
  for (let i = 0; i < 60 && !at("log").includes("Order 102 done"); i++) await wait(50);

  const logs = at("log");
  const warnings = at("warn");
  const started = logs.indexOf("Tracking started");
  const prepared = logs.indexOf("Order 101 prepared");
  const shipped = logs.indexOf("Order 101 shipped");

  return [
    {
      id: "returns-at-once",
      title: "Tracking started prints before any order is prepared",
      pass: started !== -1 && (prepared === -1 || started < prepared),
      hint:
        started === -1
          ? 'Log "Tracking started" as the last line of the file, after the calls to trackWithAwait.'
          : "Tracking started should come first, because each call stops at its first await and returns."
    },
    {
      id: "awaits-in-order",
      title: "trackWithAwait prepares and then ships order 101",
      pass: started !== -1 && prepared > started && shipped > prepared,
      hint: logs.includes("Order undefined undefined")
        ? "An order logs as undefined, so an await is missing before prepare(order) or ship(prepared)."
        : "Call trackWithAwait instead of track; in it, await prepare(order), log it, then await ship(prepared) and log that."
    },
    {
      id: "try-catch-finally",
      title: "Order 102's failure is caught, and both orders print done",
      pass:
        started !== -1 &&
        warnings.includes("Problem: Order 102 has no address") &&
        logs.includes("Order 101 done") &&
        logs.includes("Order 102 done"),
      hint: "Call trackWithAwait(second), wrap the awaits in try, warn \"Problem:\" with error.message in catch, and log the done line in finally."
    }
  ];
}
