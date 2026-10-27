export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);
  const counts = lines.filter((line) => /^(Alice|Bob) adds: /.test(line));
  const bob = counts.find((line) => line.startsWith("Bob adds: "));

  return [
    {
      id: "shared-count-is-shared",
      title: "The shared counter still shows the bug the factory fixes",
      pass: has("Alice's cart: 1") && has("Bob's cart: 2"),
      hint: "Keep the starter's addToCart and its two console.log lines above the factory."
    },
    {
      id: "alice-counts-up",
      title: "Alice's counter counts 1, 2, 3 across Bob's call",
      pass:
        counts.join(",") === "Alice adds: 1,Alice adds: 2,Bob adds: 1,Alice adds: 3",
      hint: `The counter lines read: ${counts.join(", ") || "none"}. Make aliceAdds and bobAdds once each with makeCartCounter() and call them in the order Alice, Alice, Bob, Alice.`
    },
    {
      id: "bob-starts-at-one",
      title: "Bob's counter has a count of its own, and it is private",
      pass: bob === "Bob adds: 1" && has("aliceAdds.count is undefined"),
      hint:
        bob === "Bob adds: 3"
          ? "Bob shares Alice's count. Declare let count = 0; inside makeCartCounter, not above it."
          : "Call bobAdds() once after Alice's second call, and log aliceAdds.count with the label aliceAdds.count is."
    }
  ];
}
