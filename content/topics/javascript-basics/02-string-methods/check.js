const raw = "  Alice.Mandel@NEIU.edu  ";

export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);

  return [
    {
      id: "methods-return-new-strings",
      title: "trim and toLowerCase print new strings while the original stays the same",
      pass: has(`Trimmed: ${raw.trim()}`) && has(`Lowercase: ${raw.toLowerCase()}`) && has(`Still raw: ${raw}`),
      hint: "Log rawEmail.trim(), rawEmail.toLowerCase(), and then rawEmail itself; do not assign the results back to rawEmail."
    },
    {
      id: "chained-clean-email",
      title: "The chained call produces the clean address and its length",
      pass: has("Clean: alice.mandel@neiu.edu") && has("Clean length: 21"),
      hint: "Declare const email = rawEmail.trim().toLowerCase(); and log it with its length."
    },
    {
      id: "search-and-slice",
      title: "includes, indexOf, and slice print true, 12, and alice",
      pass: has("Is an NEIU address: true") && has("Position of @: 12") && has("First name: alice"),
      hint: 'Log email.includes("@neiu.edu"), email.indexOf("@"), and email.slice(0, email.indexOf(".")) with their labels.'
    }
  ];
}
