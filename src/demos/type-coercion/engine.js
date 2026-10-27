const OPERATORS = ["===", "==", "+", "-", "*", "/"];
const KEYWORDS = {
  true: true,
  false: false,
  null: null,
  undefined: undefined,
  NaN: NaN,
  Infinity: Infinity,
};
const NUMBER = /^-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/;

function primitive(value) {
  return { kind: "primitive", value };
}

function scanOperand(source, start, nested) {
  let at = start;
  while (source[at] === " ") at += 1;
  const rest = source.slice(at);
  const quote = rest[0];
  if (quote === '"' || quote === "'") {
    const end = rest.indexOf(quote, 1);
    if (end === -1) return null;
    const text = rest.slice(1, end);
    if (text.includes("\\") || (nested && /[,\]]/.test(text))) return null;
    return { operand: primitive(text), end: at + end + 1 };
  }
  if (!nested && quote === "[") {
    const close = rest.indexOf("]");
    if (close === -1) return null;
    const inner = rest.slice(1, close);
    const items = [];
    if (inner.trim() !== "") {
      let cursor = 0;
      while (cursor <= inner.length) {
        const item = scanOperand(inner, cursor, true);
        if (!item) return null;
        const value = item.operand.value;
        if (typeof value !== "number" && typeof value !== "string") return null;
        items.push(value);
        cursor = item.end;
        while (inner[cursor] === " ") cursor += 1;
        if (cursor >= inner.length) break;
        if (inner[cursor] !== ",") return null;
        cursor += 1;
      }
    }
    return { operand: { kind: "array", items }, end: at + close + 1 };
  }
  if (!nested && quote === "{") {
    const match = /^\{\s*\}/.exec(rest);
    if (!match) return null;
    return { operand: { kind: "object" }, end: at + match[0].length };
  }
  const word = /^[A-Za-z]+/.exec(rest);
  if (word && Object.hasOwn(KEYWORDS, word[0])) {
    return { operand: primitive(KEYWORDS[word[0]]), end: at + word[0].length };
  }
  const number = NUMBER.exec(rest);
  if (number && !/^[\w.]/.test(rest.slice(number[0].length))) {
    return { operand: primitive(Number(number[0])), end: at + number[0].length };
  }
  return null;
}

export function parse(source) {
  if (typeof source !== "string" || source.length > 40) return null;
  const left = scanOperand(source, 0, false);
  if (!left) return null;
  let at = left.end;
  while (source[at] === " ") at += 1;
  const operator = OPERATORS.find((candidate) => source.startsWith(candidate, at));
  if (!operator) return null;
  const right = scanOperand(source, at + operator.length, false);
  if (!right || source.slice(right.end).trim() !== "") return null;
  return { left: left.operand, operator, right: right.operand };
}

export function show(operand) {
  if (operand.kind === "array")
    return `[${operand.items.map((item) => show(primitive(item))).join(", ")}]`;
  if (operand.kind === "object") return "{}";
  const { value } = operand;
  if (typeof value === "string") return JSON.stringify(value);
  if (Object.is(value, -0)) return "-0";
  return String(value);
}

function type(operand) {
  if (operand.kind !== "primitive") return "object";
  if (operand.value === null) return "null";
  return typeof operand.value;
}

function article(operand) {
  if (operand.kind === "array") return "an array";
  if (operand.kind === "object") return "an object";
  const name = type(operand);
  if (name === "null" || name === "undefined") return name;
  return `a ${name}`;
}

function opening(operand) {
  const text = article(operand);
  return text.startsWith("a") ? `${text[0].toUpperCase()}${text.slice(1)}` : text;
}

function plural(name) {
  return name === "null" || name === "undefined" ? `${name}` : `${name}s`;
}

function toPrimitive(operand) {
  if (operand.kind === "array")
    return primitive(operand.items.map((item) => String(item)).join(","));
  if (operand.kind === "object") return primitive("[object Object]");
  return operand;
}

function sides(left, right) {
  return { left, right };
}

function expression(left, operator, right) {
  return `${show(left)} ${operator} ${show(right)}`;
}

function primitiveStep(left, operator, right, why) {
  const objects = [left, right].filter((operand) => operand.kind !== "primitive");
  if (objects.length === 0) {
    return {
      rule: "ToPrimitive",
      text: `ToPrimitive: ${why} Both sides are primitives already, so nothing changes.`,
      ...sides(left, right),
      expr: expression(left, operator, right),
    };
  }
  const notes = objects.map((operand) => {
    const from = show(operand);
    const to = show(toPrimitive(operand));
    return `${from} has no primitive valueOf, so its toString gives ${to}`;
  });
  const nextLeft = toPrimitive(left);
  const nextRight = toPrimitive(right);
  return {
    rule: "ToPrimitive",
    text: `ToPrimitive: ${why} ${notes.join(", and ")}.`,
    ...sides(nextLeft, nextRight),
    expr: expression(nextLeft, operator, nextRight),
  };
}

function conversions(pairs, name) {
  return pairs
    .filter(([from, to]) => show(from) !== show(to) || type(from) !== type(to))
    .map(([from, to]) => `${name}(${show(from)}) is ${show(to)}`)
    .join(" and ");
}

const ARITHMETIC = {
  "+": { verb: "Adding", fn: (a, b) => a + b },
  "-": { verb: "Subtracting", fn: (a, b) => a - b },
  "*": { verb: "Multiplying", fn: (a, b) => a * b },
  "/": { verb: "Dividing", fn: (a, b) => a / b },
};

function plusSteps(left, right) {
  const first = primitiveStep(
    left,
    "+",
    right,
    "+ first turns any object side into a primitive value.",
  );
  const l = first.left;
  const r = first.right;
  const ls = type(l) === "string";
  const rs = type(r) === "string";
  let second;
  let result;
  if (ls || rs) {
    const nl = primitive(String(l.value));
    const nr = primitive(String(r.value));
    const which =
      ls && rs
        ? "Both sides are strings"
        : ls
          ? "The left side is a string"
          : "The right side is a string";
    const made = conversions(
      [
        [l, nl],
        [r, nr],
      ],
      "ToString",
    );
    second = {
      rule: "ToString",
      text: `${which}, so + joins strings${made ? `: ${made}` : " and converts nothing"}.`,
      ...sides(nl, nr),
      expr: expression(nl, "+", nr),
    };
    result = primitive(nl.value + nr.value);
    return [
      first,
      second,
      {
        rule: "Join",
        text: `Joining ${show(nl)} and ${show(nr)} gives ${show(result)}.`,
        ...sides(result, null),
        expr: show(result),
        result,
      },
    ];
  }
  const nl = primitive(Number(l.value));
  const nr = primitive(Number(r.value));
  const made = conversions(
    [
      [l, nl],
      [r, nr],
    ],
    "ToNumber",
  );
  second = {
    rule: "ToNumber",
    text: made
      ? `Neither side is a string, so + adds numbers: ${made}.`
      : "Neither side is a string and both are numbers, so + adds them as they are.",
    ...sides(nl, nr),
    expr: expression(nl, "+", nr),
  };
  result = primitive(nl.value + nr.value);
  return [
    first,
    second,
    {
      rule: "Add",
      text: `Adding ${show(nl)} and ${show(nr)} gives ${show(result)}.`,
      ...sides(result, null),
      expr: show(result),
      result,
    },
  ];
}

function arithmeticSteps(left, operator, right) {
  const first = primitiveStep(
    left,
    operator,
    right,
    `${operator} only does arithmetic, and it starts by turning any object side into a primitive.`,
  );
  const nl = primitive(Number(first.left.value));
  const nr = primitive(Number(first.right.value));
  const made = conversions(
    [
      [first.left, nl],
      [first.right, nr],
    ],
    "ToNumber",
  );
  const second = {
    rule: "ToNumber",
    text: made
      ? `ToNumber: ${operator} turns both sides into numbers. ${made}.`
      : `ToNumber: ${operator} needs numbers, and both sides are numbers already.`,
    ...sides(nl, nr),
    expr: expression(nl, operator, nr),
  };
  const result = primitive(ARITHMETIC[operator].fn(nl.value, nr.value));
  return [
    first,
    second,
    {
      rule: "Compute",
      text: `${ARITHMETIC[operator].verb} gives ${show(result)}.`,
      ...sides(result, null),
      expr: show(result),
      result,
    },
  ];
}

function strictEqual(left, right) {
  if (type(left) !== type(right)) return false;
  if (left.kind !== "primitive") return false;
  return left.value === right.value;
}

function compareStep(left, right, converted) {
  const result = primitive(strictEqual(left, right));
  let text;
  if (left.kind !== "primitive") {
    text = `Both sides are objects, so == asks whether they are the same object. Two separate literals never are, so the answer is false.`;
  } else if (Number.isNaN(left.value)) {
    text = "NaN is not equal to anything, not even NaN, so the answer is false.";
  } else {
    text = `${converted ? `Now both sides are ${plural(type(left))}, so == compares them like ===` : "Same type, so the values are compared"}: ${expression(left, "===", right)} is ${result.value}.`;
  }
  return { rule: "Compare", text, ...sides(result, null), expr: show(result), result };
}

function looseSteps(left, right) {
  const steps = [];
  if (type(left) === type(right)) {
    steps.push({
      rule: "Types",
      text: `Both sides are ${plural(type(left))}, so == converts nothing and compares them like ===.`,
      ...sides(left, right),
      expr: expression(left, "==", right),
    });
    steps.push(compareStep(left, right, false));
    return steps;
  }
  steps.push({
    rule: "Types",
    text: `${opening(left)} and ${article(right)}: the types differ, so == looks up which conversion its rules call for.`,
    ...sides(left, right),
    expr: expression(left, "==", right),
  });
  let x = left;
  let y = right;
  for (let guard = 0; guard < 8; guard += 1) {
    const tx = type(x);
    const ty = type(y);
    if (tx === ty) {
      steps.push(compareStep(x, y, true));
      return steps;
    }
    const pair = [tx, ty].sort().join(" ");
    if (pair === "null undefined") {
      const result = primitive(true);
      steps.push({
        rule: "Rule",
        text: "One side is null and the other undefined. == has a rule for exactly this pair: they are equal, with no conversion.",
        ...sides(result, null),
        expr: "true",
        result,
      });
      return steps;
    }
    let nx = x;
    let ny = y;
    let rule;
    let text;
    if (tx === "number" && ty === "string") {
      ny = primitive(Number(y.value));
      rule = "ToNumber";
      text = `A number and a string: == turns the string into a number. ToNumber(${show(y)}) is ${show(ny)}.`;
    } else if (tx === "string" && ty === "number") {
      nx = primitive(Number(x.value));
      rule = "ToNumber";
      text = `A string and a number: == turns the string into a number. ToNumber(${show(x)}) is ${show(nx)}.`;
    } else if (tx === "boolean") {
      nx = primitive(Number(x.value));
      rule = "ToNumber";
      text = `A boolean on the left: == turns it into a number first. ToNumber(${show(x)}) is ${show(nx)}.`;
    } else if (ty === "boolean") {
      ny = primitive(Number(y.value));
      rule = "ToNumber";
      text = `A boolean on the right: == turns it into a number first. ToNumber(${show(y)}) is ${show(ny)}.`;
    } else if ((tx === "string" || tx === "number") && ty === "object") {
      ny = toPrimitive(y);
      rule = "ToPrimitive";
      text = `An object meets a ${tx}: == turns the object into a primitive. ${show(y)} has no primitive valueOf, so its toString gives ${show(ny)}.`;
    } else if (tx === "object" && (ty === "string" || ty === "number")) {
      nx = toPrimitive(x);
      rule = "ToPrimitive";
      text = `An object meets a ${ty}: == turns the object into a primitive. ${show(x)} has no primitive valueOf, so its toString gives ${show(nx)}.`;
    } else {
      const result = primitive(false);
      const lonely = tx === "null" || tx === "undefined" ? x : y;
      steps.push({
        rule: "Rule",
        text: `${show(lonely)} is loosely equal only to null and undefined, and no rule converts it, so ${expression(x, "==", y)} is false.`,
        ...sides(result, null),
        expr: "false",
        result,
      });
      return steps;
    }
    x = nx;
    y = ny;
    steps.push({ rule, text, ...sides(x, y), expr: expression(x, "==", y) });
  }
  return steps;
}

function strictSteps(left, right) {
  if (type(left) !== type(right)) {
    const result = primitive(false);
    return [
      {
        rule: "Types",
        text: `=== never converts. ${opening(left)} and ${article(right)} are different types, so the answer is false.`,
        ...sides(result, null),
        expr: "false",
        result,
      },
    ];
  }
  const typesStep = {
    rule: "Types",
    text: `Both sides are ${plural(type(left))}, so === goes on to compare the values, still converting nothing.`,
    ...sides(left, right),
    expr: expression(left, "===", right),
  };
  const compare = compareStep(left, right, false);
  if (left.kind !== "primitive") {
    compare.text =
      "Both sides are objects, so === asks whether they are the same object. Two separate literals never are, so the answer is false.";
  }
  return [typesStep, compare];
}

export function explain(parsed) {
  const { left, operator, right } = parsed;
  let steps;
  if (operator === "+") steps = plusSteps(left, right);
  else if (operator === "==") steps = looseSteps(left, right);
  else if (operator === "===") steps = strictSteps(left, right);
  else steps = arithmeticSteps(left, operator, right);
  const result = steps[steps.length - 1].result;
  const strict = operator === "==" ? primitive(strictSteps(left, right).at(-1).result.value) : null;
  return {
    source: expression(left, operator, right),
    left,
    right,
    operator,
    steps,
    result,
    strict,
    numeric: numericHint(left, operator, right),
  };
}

function numericHint(left, operator, right) {
  if (operator !== "+") return null;
  const numeric = (operand) =>
    type(operand) === "string" &&
    operand.value.trim() !== "" &&
    Number.isFinite(Number(operand.value));
  const plain = (operand) => type(operand) === "number";
  if (!(numeric(left) && plain(right)) && !(plain(left) && numeric(right))) return null;
  const wrap = (operand) => (numeric(operand) ? `Number(${show(operand)})` : show(operand));
  const sum = Number(left.value) + Number(right.value);
  return `${wrap(left)} + ${wrap(right)} is ${show(primitive(sum))}`;
}

export function describeOperand(operand) {
  return { text: show(operand), kind: article(operand) };
}

export function describeResult(operand) {
  return `${show(operand)}, ${article(operand)}`;
}
