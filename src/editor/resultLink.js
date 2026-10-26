// Links the editor to the result in both directions. Hovering or placing the cursor on a
// component name or JSX tag highlights that component's boxes in the result through
// `inspector-highlight`, resolved against the latest commit: a tag on the line a component was
// used at selects that instance, anything else selects every instance of the name. A jump into
// the editor flashes its target lines, unless the visitor prefers reduced motion.

import { Decoration, EditorView, ViewPlugin } from "@codemirror/view";
import { Facet, StateEffect, StateField } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";

const NAME_NODES = new Set(["JSXIdentifier", "VariableDefinition", "VariableName"]);
const COMPONENT_NAME = /^[A-Z][\w$]*$/;
const JUMP_FLASH_MS = 1600;

const fileFacet = Facet.define({ combine: (values) => values[0] ?? null });

// A ref-like object { current: { components, onHighlight } } the React side keeps up to date.
const linkFacet = Facet.define({ combine: (values) => values[0] ?? null });

// The capitalized identifier at `pos`, as { name, line }, or null.
export function componentNameAt(state, pos) {
  const tree = syntaxTree(state);
  for (const side of [1, -1]) {
    const node = tree.resolveInner(pos, side);
    if (!NAME_NODES.has(node.name)) continue;
    const name = state.doc.sliceString(node.from, node.to);
    if (!COMPONENT_NAME.test(name)) continue;
    return { name, line: state.doc.lineAt(node.from).number };
  }
  return null;
}

// Ids of the components an identifier refers to, from the latest commit's components.
export function resolveComponents(components, file, target) {
  if (!target) return [];
  const byName = components.filter((component) => component.name === target.name);
  const usedHere = byName.filter(
    (component) => component.usedAt?.file === file && component.usedAt.line === target.line,
  );
  return (usedHere.length > 0 ? usedHere : byName).map((component) => component.id);
}

const resultLinkPlugin = ViewPlugin.fromClass(
  class {
    constructor(view) {
      this.view = view;
      this.hover = [];
      this.cursor = [];
      this.sent = "";
      this.updateCursor();
    }

    update(update) {
      if (update.selectionSet || update.docChanged || update.focusChanged) this.updateCursor();
    }

    refresh() {
      this.updateCursor();
    }

    resolve(pos) {
      const link = this.view.state.facet(linkFacet)?.current;
      if (!link || pos == null) return [];
      const file = this.view.state.facet(fileFacet);
      return resolveComponents(link.components ?? [], file, componentNameAt(this.view.state, pos));
    }

    updateCursor() {
      const { state, hasFocus } = this.view;
      this.cursor = hasFocus ? this.resolve(state.selection.main.head) : [];
      this.emit();
    }

    setHover(pos) {
      this.hover = this.resolve(pos);
      this.emit();
    }

    emit() {
      const ids = this.hover.length > 0 ? this.hover : this.cursor;
      const key = ids.join(" ");
      if (key === this.sent) return;
      this.sent = key;
      this.view.state.facet(linkFacet)?.current?.onHighlight?.(ids);
    }

    destroy() {
      if (this.sent) this.view.state.facet(linkFacet)?.current?.onHighlight?.([]);
    }
  },
  {
    eventHandlers: {
      mousemove(event, view) {
        this.setHover(view.posAtCoords({ x: event.clientX, y: event.clientY }));
      },
      mouseleave() {
        this.setHover(null);
      },
    },
  },
);

const setJumpLines = StateEffect.define();
const jumpLine = Decoration.line({ class: "cm-lab-jump" });

const jumpField = StateField.define({
  create: () => Decoration.none,
  update(decorations, transaction) {
    let next = decorations.map(transaction.changes);
    for (const effect of transaction.effects) {
      if (!effect.is(setJumpLines)) continue;
      const doc = transaction.state.doc;
      next = Decoration.set(
        effect.value.map((line) => jumpLine.range(doc.line(line).from)),
        true,
      );
    }
    return next;
  },
  provide: (field) => EditorView.decorations.from(field),
});

const jumpTheme = EditorView.baseTheme({
  ".cm-lab-jump": {
    animation: `cm-lab-jump ${JUMP_FLASH_MS}ms ease-out forwards`,
  },
  "@keyframes cm-lab-jump": {
    from: {
      backgroundColor: "var(--color-warning-soft)",
      boxShadow: "inset 3px 0 0 var(--color-warning)",
    },
    to: { backgroundColor: "transparent", boxShadow: "none" },
  },
});

function prefersReducedMotion() {
  return Boolean(globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

const flashTimers = new WeakMap();

// Highlights `lines` (1-based) for a moment; skipped when the visitor prefers reduced motion.
export function flashLines(view, lines) {
  if (prefersReducedMotion()) return;
  const valid = [...new Set(lines)]
    .filter((line) => Number.isInteger(line) && line >= 1 && line <= view.state.doc.lines)
    .sort((a, b) => a - b);
  clearTimeout(flashTimers.get(view));
  view.dispatch({ effects: setJumpLines.of(valid) });
  if (valid.length === 0) return;
  flashTimers.set(
    view,
    setTimeout(() => {
      if (view.state.field(jumpField, false)) view.dispatch({ effects: setJumpLines.of([]) });
    }, JUMP_FLASH_MS),
  );
}

export function refreshResultLink(view) {
  view?.plugin(resultLinkPlugin)?.refresh();
}

export function resultLink({ file, link }) {
  return [fileFacet.of(file), linkFacet.of(link), resultLinkPlugin, jumpField, jumpTheme];
}
