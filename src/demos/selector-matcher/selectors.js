const IDENT = /^-?[_a-zA-Z][\w-]*/;
const PSEUDOS = { "first-child": "first", "last-child": "last" };

export const SUPPORTED =
  "element names, *, .class, #id, a space, >, commas, :first-child, and :last-child";

function unsupported(text) {
  if (text.includes("[")) return "attribute selectors such as [href]";
  if (text.includes("::")) return "pseudo-elements such as ::before";
  if (text.includes("+")) return "the + combinator, which picks the next sibling";
  if (text.includes("~")) return "the ~ combinator, which picks later siblings";
  if (text.includes("|")) return "namespaces";
  const pseudo = /:(-?[_a-zA-Z][\w-]*)/g;
  for (const match of text.matchAll(pseudo)) {
    if (!PSEUDOS[match[1]]) return `the :${match[1]} pseudo-class`;
  }
  if (/[()\\"']/.test(text)) return "functions, quotes, and escapes";
  return null;
}

function parseCompound(text, start) {
  let index = start;
  const compound = { tag: null, classes: [], ids: [], pseudos: [] };
  if (text[index] === "*") {
    compound.tag = "*";
    index += 1;
  } else {
    const name = IDENT.exec(text.slice(index));
    if (name) {
      compound.tag = name[0].toLowerCase();
      index += name[0].length;
    }
  }
  for (;;) {
    const mark = text[index];
    if (mark !== "." && mark !== "#" && mark !== ":") break;
    const name = IDENT.exec(text.slice(index + 1));
    if (!name) return null;
    if (mark === ".") compound.classes.push(name[0]);
    else if (mark === "#") compound.ids.push(name[0]);
    else compound.pseudos.push(PSEUDOS[name[0]]);
    index += 1 + name[0].length;
  }
  if (index === start) return null;
  return { compound, end: index };
}

function parseComplex(text) {
  const parts = [];
  let index = 0;
  let combinator = null;
  const skip = () => {
    const from = index;
    while (index < text.length && /\s/.test(text[index])) index += 1;
    return index > from;
  };
  skip();
  while (index < text.length) {
    const parsed = parseCompound(text, index);
    if (!parsed) return null;
    parts.push({ combinator, compound: parsed.compound });
    index = parsed.end;
    const spaced = skip();
    if (index >= text.length) break;
    if (text[index] === ">") {
      index += 1;
      skip();
      if (index >= text.length) return null;
      combinator = ">";
    } else if (spaced) {
      combinator = " ";
    } else {
      return null;
    }
  }
  return parts.length ? parts : null;
}

export function parseSelector(source) {
  const text = typeof source === "string" ? source.trim() : "";
  if (text === "") return { status: "empty", text };
  const what = unsupported(text);
  if (what) return { status: "unsupported", text, what };
  const list = text.split(",").map(parseComplex);
  if (list.some((parts) => parts === null)) return { status: "invalid", text };
  return { status: "ok", text, list };
}

function matchesCompound(element, compound) {
  if (compound.tag && compound.tag !== "*" && element.tag !== compound.tag) return false;
  if (!compound.classes.every((name) => element.classes.includes(name))) return false;
  if (!compound.ids.every((name) => element.id === name)) return false;
  return compound.pseudos.every((pseudo) => (pseudo === "first" ? element.first : element.last));
}

function matchesFrom(element, parts, at) {
  if (!matchesCompound(element, parts[at].compound)) return false;
  if (at === 0) return true;
  if (parts[at].combinator === ">") {
    return Boolean(element.parent) && matchesFrom(element.parent, parts, at - 1);
  }
  for (let ancestor = element.parent; ancestor; ancestor = ancestor.parent) {
    if (matchesFrom(ancestor, parts, at - 1)) return true;
  }
  return false;
}

export function matchingComplex(element, parsed) {
  if (parsed.status !== "ok") return [];
  return parsed.list.filter((parts) => matchesFrom(element, parts, parts.length - 1));
}

export function matches(element, parsed) {
  return matchingComplex(element, parsed).length > 0;
}

export function specificity(parts) {
  return parts.reduce(
    ([ids, classes, types], { compound }) => [
      ids + compound.ids.length,
      classes + compound.classes.length + compound.pseudos.length,
      types + (compound.tag && compound.tag !== "*" ? 1 : 0),
    ],
    [0, 0, 0],
  );
}

export function compareSpecificity(a, b) {
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return 0;
}

export function buildTree(spec, parent = null, position = { index: 0, count: 1 }) {
  const element = {
    tag: spec.tag,
    classes: spec.classes ?? [],
    id: spec.id ?? null,
    text: spec.text ?? null,
    parent,
    first: position.index === 0,
    last: position.index === position.count - 1,
    children: [],
  };
  const kids = spec.children ?? [];
  element.children = kids.map((child, index) =>
    buildTree(child, element, { index, count: kids.length }),
  );
  return element;
}

export function flatten(element, depth = 0, out = []) {
  out.push({ element, depth });
  element.children.forEach((child) => flatten(child, depth + 1, out));
  return out;
}

function list(words) {
  if (words.length <= 1) return words.join("");
  return `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}

function describeCompound({ tag, classes, ids, pseudos }) {
  const noun = tag && tag !== "*" ? `<${tag}> elements` : "elements";
  const named = [];
  if (classes.length) named.push(`${classes.length > 1 ? "classes" : "class"} ${list(classes)}`);
  if (ids.length) named.push(`id ${list(ids)}`);
  const words = [noun];
  if (named.length) words.push(`with ${named.join(" and ")}`);
  for (const pseudo of [...new Set(pseudos)]) {
    words.push(`that are the ${pseudo} child of their parent`);
  }
  return words.join(" ");
}

export function describe(parts) {
  const last = parts.length - 1;
  let words = describeCompound(parts[last].compound);
  if (words === "elements") words = "every element";
  for (let at = last; at > 0; at -= 1) {
    const how = parts[at].combinator === ">" ? "directly inside" : "inside";
    words += `, ${how} ${describeCompound(parts[at - 1].compound)}`;
  }
  return words;
}
