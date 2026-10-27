// The Phase 6 step fences and sections of docs/CONTRACTS.md section 7, shared by the validator
// and the renderer so that both read a step the same way:
// - a demo fence, ```demo name="<id>"```, whose body is empty or one JSON object of props;
// - predict and quiz fences: a question line, two to four options starting with "- ", exactly one
//   starting with "= " (the answer), and for a quiz, explanation lines starting with "> ";
// - the "## Read more" heading, which folds the step from there to the **Check:** paragraph;
// - the links field on topic.json and in step front matter.

import { readFileSync } from "node:fs";
import { fenceCode, parseInfo } from "./edits.mjs";

export const QUESTION_KINDS = ["predict", "quiz"];
export const FENCE_KINDS = ["demo", ...QUESTION_KINDS];
export const LINK_KINDS = ["lecture", "reading", "reference"];
export const READ_MORE = "Read more";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const registryUrl = new URL("../../src/demos/registry.json", import.meta.url);

let registry = null;

// The explainer registry, src/demos/registry.json: [{ id, title, description }].
export function demoRegistry() {
  registry ??= JSON.parse(readFileSync(registryUrl, "utf8"));
  return registry;
}

export function fenceKind(info) {
  const { lang } = parseInfo(info);
  return FENCE_KINDS.includes(lang) ? lang : null;
}

// One demo fence: { id, props } or { error }.
export function parseDemo(token) {
  const { attrs } = parseInfo(token.info);
  const id = attrs.name;
  if (!id) return { error: 'needs a name attribute, as in demo name="event-loop"' };
  if (!demoRegistry().some((entry) => entry.id === id)) {
    return {
      id,
      error: `names explainer ${JSON.stringify(id)}, which is not in src/demos/registry.json`,
    };
  }
  const body = fenceCode(token.content).trim();
  if (body === "") return { id, props: {} };
  let props;
  try {
    props = JSON.parse(body);
  } catch (error) {
    return { id, error: `body is not valid JSON: ${error.message}` };
  }
  if (!props || typeof props !== "object" || Array.isArray(props)) {
    return { id, error: "body must be one JSON object of props, or empty" };
  }
  return { id, props };
}

// One predict or quiz fence, numbered k within its kind:
// { id, kind, question, options, answer, explanation } or { id, kind, error }.
export function parseQuestion(token, k) {
  const { lang: kind, attrs } = parseInfo(token.info);
  const id = attrs.id ?? `${kind}-${k}`;
  const fail = (error) => ({ id, kind, error });
  if (attrs.id !== undefined && !SLUG.test(attrs.id)) {
    return fail(`id ${JSON.stringify(attrs.id)} must be a lowercase hyphenated slug`);
  }
  const lines = fenceCode(token.content)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
  const [question, ...rest] = lines;
  if (!question || /^[-=>] /.test(question)) {
    return fail("must start with a question line before the options");
  }
  const options = [];
  const explanation = [];
  let answer = -1;
  for (const line of rest) {
    if (explanation.length > 0 && !line.startsWith("> ")) {
      return fail("explanation lines starting with > must come last");
    }
    if (line.startsWith("- ") || line.startsWith("= ")) {
      if (line.startsWith("= ")) {
        if (answer !== -1) return fail("marks more than one answer with =; mark exactly one");
        answer = options.length;
      }
      options.push(line.slice(2).trim());
    } else if (line.startsWith("> ")) {
      if (kind !== "quiz") return fail("has an explanation line, which only a quiz may have");
      explanation.push(line.slice(2).trim());
    } else {
      return fail(`line ${JSON.stringify(line)} is not an option (- or =) or an explanation (>)`);
    }
  }
  if (options.length < 2 || options.length > 4) {
    return fail(`has ${options.length} option(s); a question needs two to four`);
  }
  if (answer === -1) return fail(`marks no answer; start exactly one option with "= "`);
  return {
    id,
    kind,
    question,
    options,
    answer,
    explanation: kind === "quiz" && explanation.length > 0 ? explanation.join(" ") : null,
  };
}

// Every demo and question fence of a parsed markdown-it token stream, in body order:
// { demos: [{ id, props, line, error? }], questions: [{ ..., line, error? }] }.
export function fencesFromTokens(tokens) {
  const demos = [];
  const questions = [];
  const counts = { predict: 0, quiz: 0 };
  for (const token of tokens) {
    if (token.type !== "fence") continue;
    const kind = fenceKind(token.info);
    if (!kind) continue;
    const line = token.map ? token.map[0] + 1 : null;
    if (kind === "demo") demos.push({ ...parseDemo(token), line });
    else {
      counts[kind] += 1;
      questions.push({ ...parseQuestion(token, counts[kind]), line });
    }
  }
  return { demos, questions };
}

function inlineText(tokens, index) {
  return tokens[index + 1]?.type === "inline" ? tokens[index + 1].content.trim() : "";
}

export function isReadMoreHeading(tokens, index) {
  const token = tokens[index];
  return (
    token.type === "heading_open" &&
    token.tag === "h2" &&
    token.level === 0 &&
    inlineText(tokens, index) === READ_MORE
  );
}

export function isCheckParagraph(tokens, index) {
  const token = tokens[index];
  return (
    token.type === "paragraph_open" &&
    token.level === 0 &&
    inlineText(tokens, index).startsWith("**Check:**")
  );
}

function isIfItBreaksParagraph(tokens, index) {
  const token = tokens[index];
  return (
    token.type === "paragraph_open" &&
    token.level === 0 &&
    inlineText(tokens, index).startsWith("**If it breaks:**")
  );
}

// Where the Read more section starts and where its Check paragraph is, as token indexes:
// { headings: [index...], check: index | -1, lateIfItBreaks: index | -1 } with check the first
// Check after the first heading and lateIfItBreaks an If it breaks paragraph after that Check.
export function readMoreSection(tokens) {
  const headings = [];
  let check = -1;
  let lateIfItBreaks = -1;
  tokens.forEach((_, index) => {
    if (isReadMoreHeading(tokens, index)) headings.push(index);
    else if (headings.length > 0 && check === -1 && isCheckParagraph(tokens, index)) check = index;
    else if (check !== -1 && lateIfItBreaks === -1 && isIfItBreaksParagraph(tokens, index))
      lateIfItBreaks = index;
  });
  return { headings, check, lateIfItBreaks };
}

// Problems with a links value, as reasons; [] when the value is absent or valid.
export function linkProblems(links) {
  if (links === undefined) return [];
  if (!Array.isArray(links)) return ["links must be a list of { kind, title, url }"];
  const problems = [];
  links.forEach((link, index) => {
    const where = `link ${index + 1}`;
    if (!link || typeof link !== "object" || Array.isArray(link)) {
      problems.push(`${where} must be an object with kind, title, and url`);
      return;
    }
    if (!LINK_KINDS.includes(link.kind)) {
      problems.push(
        `${where} has kind ${JSON.stringify(link.kind)}; expected one of ${LINK_KINDS.join(", ")}`,
      );
    }
    if (typeof link.title !== "string" || link.title.trim() === "") {
      problems.push(`${where} needs a title`);
    }
    if (typeof link.url !== "string" || !/^https:\/\/\S+$/.test(link.url)) {
      problems.push(`${where} needs a url that starts with https://`);
    }
    const extra = Object.keys(link).filter((key) => !["kind", "title", "url"].includes(key));
    if (extra.length > 0) problems.push(`${where} has unknown field(s) ${extra.join(", ")}`);
  });
  return problems;
}

// A valid links value in the compiled shape, or null when absent.
export function compiledLinks(links) {
  if (!Array.isArray(links) || linkProblems(links).length > 0) return null;
  return links.map(({ kind, title, url }) => ({ kind, title, url }));
}
