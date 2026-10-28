// Turns the content model into the JSON documents of docs/CONTRACTS.md section 3:
// public/content/index.json and public/content/topics/<id>.json.

const TOPIC_FIELDS = [
  "id",
  "title",
  "area",
  "summary",
  "prerequisites",
  "minutes",
  "updated",
  "changeNote",
  "links",
];

function topicMeta(topic) {
  return Object.fromEntries(TOPIC_FIELDS.map((field) => [field, topic[field]]));
}

export function buildIndex(content, generatedAt) {
  return {
    generatedAt,
    areas: content.areas,
    topics: content.topics.map((topic) => ({
      ...topicMeta(topic),
      steps: topic.steps.map(({ n, slug, title, mode }) => ({ n, slug, title, mode })),
    })),
    paths: content.paths,
    presets: content.presets,
  };
}

export function buildTopic(topic, render) {
  return {
    ...topicMeta(topic),
    steps: topic.steps.map((step) => {
      const editing = step.mode === "edit";
      return {
        n: step.n,
        slug: step.slug,
        title: step.title,
        mode: step.mode,
        html: render(step.body),
        entry: editing ? step.entry : null,
        inspector: step.inspector,
        api: step.api,
        required: step.required,
        starterCompiles: step.starterCompiles,
        links: step.links,
        demos: step.demos,
        questions: step.questions,
        edits: step.edits,
        workspace: editing ? step.workspace : null,
        solution: editing ? step.solution : null,
        fixtures: step.fixtures,
        check: step.check,
        local: step.local,
      };
    }),
  };
}
