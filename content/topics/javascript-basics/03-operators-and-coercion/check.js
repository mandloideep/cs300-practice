export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);

  return [
    {
      id: "strict-equality",
      title: "=== compares type and value while == converts first",
      pass: has('5 === "5": false') && has('5 == "5": true'),
      hint: 'Log 5 === "5" and 5 == "5" with the labels \'5 === "5":\' and \'5 == "5":\' in single quotes.'
    },
    {
      id: "plus-concatenates",
      title: "+ joins strings, - does arithmetic, and the baNaNa line prints",
      pass: has('"5" + 3: 53') && has('"5" - 3: 2') && has('"b" + "a" + +"a" + "a": baNaNa'),
      hint: 'Log "5" + 3, "5" - 3, and "b" + "a" + +"a" + "a" with their labels; the middle plus of the last one is a unary plus.'
    },
    {
      id: "explicit-conversion",
      title: "Number converts on purpose, and the decimal and NaN edges print",
      pass:
        has("typed + 1: 421") &&
        has("Number(typed) + 1: 43") &&
        has('Number(""): 0') &&
        has('Number("abc"): NaN') &&
        has("0.1 + 0.2: 0.30000000000000004") &&
        has("Rounded for display: 0.30"),
      hint: 'Convert with Number(typed) before adding, log Number("") and Number("abc"), and show 0.1 + 0.2 both raw and with toFixed(2).'
    }
  ];
}
