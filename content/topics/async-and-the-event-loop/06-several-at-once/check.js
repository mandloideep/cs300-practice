const VALUES = '["3 courses","2 classes today","1 announcement"]';

export default async function check({ console, wait }) {
  const at = (level) => console.filter((entry) => entry.level === level).map((entry) => entry.text);
  const done = () => at("log").some((line) => line.startsWith("rejected:"));
  for (let i = 0; i < 80 && !done(); i++) await wait(50);

  const logs = at("log");
  const timing = (label) => {
    const line = logs.find((text) => text.startsWith(`${label}: `));
    const match = line?.match(/^[^:]+: (\d+) ms (.*)$/);
    return match ? { ms: Number(match[1]), values: match[2] } : null;
  };
  const sequential = timing("One by one");
  const parallel = timing("Together");

  return [
    {
      id: "one-by-one-adds-up",
      title: "Three awaits one after another take the sum of the waits",
      pass: sequential !== null && sequential.ms >= 440 && sequential.values === VALUES,
      hint: sequential
        ? `One by one took ${sequential.ms} ms with ${sequential.values}. Keep the starter's oneByOne as it is.`
        : "The One by one line is missing; main should still await oneByOne() first."
    },
    {
      id: "together-overlaps",
      title: "Promise.all overlaps the waits and keeps the values in order",
      pass: parallel !== null && sequential !== null && parallel.ms < sequential.ms - 150 && parallel.values === VALUES,
      hint: parallel
        ? `Together took ${parallel.ms} ms with ${parallel.values}. Pass Promise.all the three load promises themselves, with no await inside the array.`
        : "Add together(), which awaits Promise.all of the three loads, and await it in main after oneByOne."
    },
    {
      id: "all-rejects-on-the-first-failure",
      title: "Promise.all rejects with the failing promise's error, and the rejection is caught",
      pass: at("warn").includes("Promise.all rejected: News is down") && !logs.some((line) => line.startsWith("All:")),
      hint: "Add oneFails(), which awaits Promise.all of a load and fail(\"News is down\", 100) inside try, and warns \"Promise.all rejected:\" with error.message in catch."
    },
    {
      id: "settled-reports-each",
      title: "Promise.allSettled reports one fulfilled and one rejected result",
      pass: logs.includes("fulfilled: 3 courses") && logs.includes("rejected: News is down"),
      hint: "Add settleEach(), which awaits Promise.allSettled of the same two promises and logs each result's status with its value or reason.message."
    }
  ];
}
