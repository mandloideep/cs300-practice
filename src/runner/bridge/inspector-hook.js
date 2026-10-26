// Bridge part 2: the inspector hook. It runs after core.js and before React loads, installs the
// global hook React DevTools uses, and on every React commit walks the fiber tree to describe the
// function components that rendered: name, parent, props, useState values, whether each one did
// work in this commit, the DOM it rendered, where it is declared, and the JSX line that used it.
// Each commit is pushed to __LAB__.inspector.commits, stored as __LAB__.inspector.latest, and
// posted to the parent. It also draws the overlay (boundary boxes, labels, re-render flashes)
// in a fixed layer inside this document, and it records the flow trace: the runtime wrappers
// report every call of a labeled handler, prop, or setter to __LAB__.flow, and each trace is
// closed by the next commit (or one frame later when nothing committed), pushed to
// __LAB__.inspector.traces, and posted as a `flow` message. See docs/CONTRACTS.md section 4.3
// and docs/DESIGN.md section 5.
//
// The fiber fields read here (tag, type, child, sibling, return, memoizedProps, memoizedState,
// stateNode, flags, alternate, _debugStack) are React internals; the runtime is pinned and the
// Playwright suite asserts this output for every React step, so an upgrade that changes them
// fails the tests.

"use strict";

const lab = globalThis.__LAB__;

if (lab?.inspectorEnabled && !globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  installInspector();
}

function installInspector() {
  // Fiber tags from React 19.2 (ReactWorkTags).
  const FunctionComponent = 0;
  const ClassComponent = 1;
  const HostComponent = 5;
  const HostText = 6;
  const ForwardRef = 11;
  const SimpleMemoComponent = 15;
  const OffscreenComponent = 22;
  const HostHoistable = 26;
  const HostSingleton = 27;
  const PerformedWork = 1;

  const COMPONENT_TAGS = new Set([
    FunctionComponent,
    ClassComponent,
    ForwardRef,
    SimpleMemoComponent,
  ]);
  const HOST_TAGS = new Set([HostComponent, HostText, HostSingleton]);

  // Elements made by the jsx-dev-runtime wrapper: element._debugStack -> Sucrase's source.
  const sources = new WeakMap();
  lab.inspectorSources = sources;

  const ids = new WeakMap();
  let nextId = 1;
  let seq = 0;
  const roots = new Map();

  function idFor(fiber) {
    let id = ids.get(fiber) ?? (fiber.alternate && ids.get(fiber.alternate));
    if (!id) id = `c${nextId++}`;
    ids.set(fiber, id);
    if (fiber.alternate) ids.set(fiber.alternate, id);
    return id;
  }

  function componentName(fiber) {
    const type = fiber.type;
    if (typeof type === "function") return type.displayName || type.name || "Anonymous";
    if (type && typeof type === "object") {
      const inner = type.render ?? type.type;
      return type.displayName || inner?.displayName || inner?.name || "Anonymous";
    }
    return "Anonymous";
  }

  // The first frame of a stack that points into a workspace module.
  function workspaceFrame(stack) {
    for (const match of String(stack ?? "").matchAll(/(blob:[^\s)]+?):(\d+):(\d+)/g)) {
      const file = lab.fileForUrl(match[1]);
      if (file && file !== "check.js") return { file, line: Number(match[2]) };
    }
    return null;
  }

  function usedAt(fiber) {
    const debugStack = fiber._debugStack;
    if (!debugStack) return null;
    const source = sources.get(debugStack);
    if (source?.fileName) return { file: source.fileName, line: source.lineNumber };
    return workspaceFrame(debugStack.stack);
  }

  function declaredAt(name, used) {
    const declarations = lab.declarations ?? {};
    if (used && declarations[used.file]?.[name]) {
      return { file: used.file, line: declarations[used.file][name] };
    }
    const files = Object.keys(declarations).filter((file) => declarations[file]?.[name]);
    // Prefer a file named after the component, such as src/Card.jsx for Card.
    const own = files.find((file) => file.replace(/^.*\/|\.\w+$/g, "") === name);
    const file = own ?? files[0];
    return file ? { file, line: declarations[file][name] } : null;
  }

  // useState and useReducer hooks have a queue with a dispatch function; effects, refs, and
  // memos do not. `hook` is the position in the component's hook list. The dispatch function
  // is the one the wrapped useState returned to the component, so it is remembered here to map
  // a setter call in the flow trace back to this instance and hook.
  function stateOf(fiber, id) {
    if (fiber.tag === ClassComponent) {
      return fiber.memoizedState == null
        ? []
        : [{ hook: 0, value: lab.serialize(fiber.memoizedState) }];
    }
    const state = [];
    let hook = fiber.memoizedState;
    let index = 0;
    while (hook && typeof hook === "object" && "next" in hook && index < 100) {
      if (hook.queue && typeof hook.queue.dispatch === "function") {
        state.push({ hook: index, value: lab.serialize(hook.memoizedState) });
        setters.set(hook.queue.dispatch, { id, hook: index });
      }
      hook = hook.next;
      index += 1;
    }
    return state;
  }

  // DOM nodes a component rendered: the host fibers below it, stopping at child components.
  function hostNodes(fiber) {
    const nodes = [];
    const visit = (node) => {
      for (let child = node.child; child; child = child.sibling) {
        if (HOST_TAGS.has(child.tag)) {
          if (child.stateNode) nodes.push(child.stateNode);
        } else if (child.tag === HostHoistable || COMPONENT_TAGS.has(child.tag)) {
          continue;
        } else if (child.tag === OffscreenComponent && child.memoizedState !== null) {
          continue;
        } else {
          visit(child);
        }
      }
    };
    visit(fiber);
    return nodes;
  }

  function rectOf(node) {
    let rect;
    if (node.nodeType === Node.TEXT_NODE) {
      const range = document.createRange();
      range.selectNodeContents(node);
      rect = range.getBoundingClientRect();
    } else if (node.getBoundingClientRect) {
      rect = node.getBoundingClientRect();
    } else {
      return null;
    }
    if (rect.width === 0 && rect.height === 0) return null;
    const round = (value) => Math.round(value * 10) / 10;
    return {
      x: round(rect.x),
      y: round(rect.y),
      width: round(rect.width),
      height: round(rect.height),
    };
  }

  function rectsOf(nodes) {
    return nodes.map(rectOf).filter(Boolean);
  }

  // A fiber performed work in this commit when it is new, or when it is not the very object that
  // was committed last time (React cloned it) and its PerformedWork flag is set.
  function didRender(fiber, previous) {
    if (!fiber.alternate) return true;
    if (previous.has(fiber)) return false;
    return (fiber.flags & PerformedWork) === PerformedWork;
  }

  function walkRoot(root, rootState) {
    const components = [];
    const seen = new WeakSet();
    const visit = (fiber, parentId) => {
      for (let node = fiber; node; node = node.sibling) {
        seen.add(node);
        let nextParent = parentId;
        if (node.tag === OffscreenComponent && node.memoizedState !== null) continue;
        if (COMPONENT_TAGS.has(node.tag)) {
          const id = idFor(node);
          const name = componentName(node);
          const used = usedAt(node);
          const nodes = hostNodes(node);
          components.push({
            id,
            name,
            parentId,
            props: lab.serialize(node.memoizedProps ?? {}),
            state: stateOf(node, id),
            rendered: didRender(node, rootState.previous),
            rects: rectsOf(nodes),
            declaredAt: declaredAt(name, used),
            usedAt: used,
          });
          overlayNodes.set(id, nodes);
          nextParent = id;
        }
        if (node.child) visit(node.child, nextParent);
      }
    };
    if (root.current?.child) visit(root.current.child, null);
    rootState.previous = seen;
    rootState.components = components;
  }

  function onCommitFiberRoot(_rendererId, root) {
    try {
      let rootState = roots.get(root);
      if (!rootState) {
        rootState = { previous: new WeakSet(), components: [] };
        roots.set(root, rootState);
      }
      overlayNodes.clear();
      walkRoot(root, rootState);
      if (!root.current?.child) roots.delete(root);

      const components = [...roots.values()].flatMap((state) => state.components);
      const commit = { seq: ++seq, time: performance.now(), components };
      lab.inspector.commits.push(commit);
      lab.inspector.latest = commit;
      lab.post({ type: "inspector", commit });
      overlay.update(commit);
      flow.onCommit(commit);
    } catch (error) {
      lab.originalConsole.warn.call(
        console,
        "The lab inspector could not read this commit.",
        error,
      );
    }
  }

  const renderers = new Map();
  globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    renderers,
    supportsFiber: true,
    isDisabled: false,
    inject(internals) {
      const id = renderers.size + 1;
      renderers.set(id, internals);
      return id;
    },
    onCommitFiberRoot,
    onCommitFiberUnmount() {},
    onPostCommitFiberRoot() {},
    onScheduleFiberRoot() {},
    setStrictMode() {},
  };

  // Flow trace ---------------------------------------------------------------------------------

  // Real dispatch function of each useState or useReducer hook -> { id, hook }, filled per commit.
  const setters = new WeakMap();

  // DOM events whose dispatch is remembered so a setter called from a plain addEventListener
  // handler still reports the event it ran in, with no handler owner.
  const NATIVE_EVENTS = [
    "click",
    "dblclick",
    "input",
    "change",
    "submit",
    "reset",
    "keydown",
    "keyup",
    "pointerdown",
    "pointerup",
    "mousedown",
    "mouseup",
    "touchstart",
    "touchend",
    "focusin",
    "focusout",
  ];

  function round(value) {
    return Math.round(value * 10) / 10;
  }

  // Runs `callback` once after one animation frame, or after 250ms when frames do not run.
  function afterFrame(callback) {
    let done = false;
    const once = () => {
      if (done) return;
      done = true;
      callback();
    };
    requestAnimationFrame(() => setTimeout(once, 0));
    setTimeout(once, 250);
  }

  function isEvent(value) {
    if (value instanceof Event) return true;
    return Boolean(value) && typeof value === "object" && value.nativeEvent instanceof Event;
  }

  function describeEvent(event, handlerOwner) {
    const target = event.target;
    return {
      type: event.type ?? null,
      target: target && typeof target === "object" ? lab.serialize(target) : null,
      handlerOwner,
    };
  }

  function serializeArgument(value) {
    return isEvent(value) ? `[Event ${value.type}]` : lab.serialize(value);
  }

  lab.inspector.traces = [];

  const flow = (() => {
    let open = null;
    let count = 0;
    const handlers = [];
    let native = null;

    // Opens a trace in the current event context, or with no event when `context` is null.
    function start(context = handlers.at(-1) ?? native) {
      count += 1;
      const trace = {
        id: `t${count}`,
        seq: count,
        startTime: round(performance.now()),
        duration: 0,
        event: context ? { ...context } : null,
        entries: [],
        rendered: [],
        commitSeq: null,
      };
      open = trace;
      afterFrame(() => {
        if (open === trace) close([], null);
      });
      return trace;
    }

    function close(rendered, commitSeq) {
      const trace = open;
      open = null;
      trace.rendered = rendered;
      trace.commitSeq = commitSeq;
      trace.duration = round(performance.now() - trace.startTime);
      lab.inspector.traces.push(trace);
      lab.post({ type: "flow", trace });
    }

    // Called by the wrappers before a labeled function runs. `original` is the function the
    // wrapper stands for, `change` is { previous, next } for a setter and null otherwise.
    function enter(owner, original, args, change) {
      if (owner.kind === "handler") {
        const event = args[0];
        handlers.push(
          isEvent(event)
            ? describeEvent(event, owner.component)
            : { type: null, target: null, handlerOwner: owner.component },
        );
        if (!open) start();
        return true;
      }
      const trace = open ?? start();
      const time = round(performance.now() - trace.startTime);
      if (owner.kind === "prop") {
        trace.entries.push({
          kind: "prop-call",
          time,
          prop: owner.prop,
          passedBy: owner.component,
          calledIn: owner.to ?? null,
          args: args.map(serializeArgument),
        });
      } else if (owner.kind === "setter") {
        trace.entries.push({
          kind: "setter",
          time,
          component: owner.component,
          hook: setters.get(original)?.hook ?? null,
          hookName: owner.hook,
          previous: change ? lab.serialize(change.previous) : null,
          next: change ? lab.serialize(change.next) : null,
        });
      }
      return false;
    }

    function exit(isHandler) {
      if (isHandler) handlers.pop();
    }

    function onCommit(commit) {
      if (!open) return;
      close(
        commit.components.filter((component) => component.rendered).map((c) => c.name),
        commit.seq,
      );
    }

    // Called by the fetch shim when a request starts; it lands in the open trace, if any.
    function request(fields) {
      if (!open) return;
      open.entries.push({
        kind: "request",
        time: round(performance.now() - open.startTime),
        ...fields,
      });
    }

    // Called by the fetch shim when a response settles; outside a trace it opens one with no
    // event, so the response, the setter it leads to, and the render set form one trace.
    function response(fields) {
      const trace = open ?? start(null);
      trace.entries.push({
        kind: "response",
        time: round(performance.now() - trace.startTime),
        ...fields,
      });
    }

    // Dispatch is synchronous within its task, so a timer set at capture time clears the context
    // after every listener, including ones added to window after this one, has run.
    for (const type of NATIVE_EVENTS) {
      window.addEventListener(
        type,
        (event) => {
          const context = describeEvent(event, null);
          native = context;
          setTimeout(() => {
            if (native === context) native = null;
          }, 0);
        },
        true,
      );
    }

    return { enter, exit, onCommit, request, response };
  })();
  lab.flow = flow;

  // The component whose render or effect is running right now, from the owner React DOM tracks
  // in development; null between renders, as inside an event handler or a timer.
  lab.currentComponent = () => {
    for (const internals of renderers.values()) {
      const fiber = internals.currentDispatcherRef?.A?.getOwner?.();
      if (fiber && COMPONENT_TAGS.has(fiber.tag)) return componentName(fiber);
    }
    return null;
  };

  // Overlay ------------------------------------------------------------------------------------

  const overlayNodes = new Map();

  const overlay = (() => {
    let views = new Set(["boundaries", "flash", "tree"]);
    let highlighted = new Set();
    let commit = null;
    let frame = 0;
    const flashing = new Map();

    const host = document.createElement("lab-inspector-overlay");
    host.setAttribute("aria-hidden", "true");
    host.style.cssText =
      "all: initial !important; position: fixed !important; inset: 0 !important; z-index: 2147483647 !important; pointer-events: none !important; display: block !important;";
    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `<style>
      :host { all: initial; }
      .layer { position: fixed; inset: 0; pointer-events: none; font: 600 11px/1.3 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
      .box { position: fixed; box-sizing: border-box; border: 1.5px solid var(--hue); border-radius: 3px; background: color-mix(in srgb, var(--hue) 6%, transparent); }
      .box.highlight { border-width: 3px; background: color-mix(in srgb, var(--hue) 22%, transparent); }
      .label { position: fixed; box-sizing: border-box; max-width: 60vw; padding: 1px 6px; border: 0; border-radius: 3px; background: var(--hue); color: #fff; font: inherit; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; pointer-events: auto; cursor: pointer; text-shadow: 0 1px 1px rgb(0 0 0 / 0.35); }
      .label:hover, .label:focus-visible { max-width: 90vw; z-index: 1; outline: 2px solid #fff; outline-offset: 0; }
      .label .props { font-weight: 400; opacity: 0.92; }
      .label:not(:hover):not(:focus-visible) .props { display: none; }
      .flash { position: fixed; box-sizing: border-box; border: 2px solid #f5a623; border-radius: 3px; background: rgb(245 166 35 / 0.25); animation: pulse 700ms ease-out forwards; }
      @keyframes pulse { 0% { opacity: 1; } 100% { opacity: 0; } }
      @media (prefers-reduced-motion: reduce) {
        .flash { animation: none; opacity: 0.85; background: transparent; border-style: dashed; }
      }
    </style><div class="layer"></div>`;
    const layer = shadow.querySelector(".layer");

    function attach() {
      if (!host.isConnected) document.documentElement.append(host);
    }

    function hueFor(name) {
      let hash = 0;
      for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
      return `hsl(${hash % 360} 70% 42%)`;
    }

    function summarize(props) {
      const text = Object.entries(props ?? {})
        .filter(([key]) => key !== "children")
        .map(
          ([key, value]) =>
            `${key}: ${typeof value === "string" ? JSON.stringify(value) : (JSON.stringify(value) ?? "undefined")}`,
        )
        .join(", ");
      return text.length > 90 ? `${text.slice(0, 89)}…` : text;
    }

    function liveRects(id, fallback) {
      const nodes = overlayNodes.get(id);
      return nodes ? rectsOf(nodes) : fallback;
    }

    function place(element, rect) {
      element.style.left = `${rect.x}px`;
      element.style.top = `${rect.y}px`;
      element.style.width = `${rect.width}px`;
      element.style.height = `${rect.height}px`;
    }

    function draw() {
      frame = 0;
      layer.replaceChildren();
      if (!commit) return;
      const showBoxes = views.has("boundaries");
      const placedLabels = [];

      for (const component of commit.components) {
        const isHighlighted = highlighted.has(component.id);
        if (!showBoxes && !isHighlighted) continue;
        const rects = liveRects(component.id, component.rects);
        if (rects.length === 0) continue;
        const hue = hueFor(component.name);

        for (const rect of rects) {
          const box = document.createElement("div");
          box.className = isHighlighted ? "box highlight" : "box";
          box.dataset.name = component.name;
          box.style.setProperty("--hue", hue);
          place(box, rect);
          layer.append(box);
        }

        const label = document.createElement("button");
        label.type = "button";
        label.className = "label";
        label.tabIndex = -1;
        label.style.setProperty("--hue", hue);
        label.textContent = component.name;
        const summary = summarize(component.props);
        if (summary) {
          const props = document.createElement("span");
          props.className = "props";
          props.textContent = ` ${summary}`;
          label.append(props);
        }
        label.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          lab.post({
            type: "inspector-select",
            componentId: component.id,
            name: component.name,
            declaredAt: component.declaredAt,
            usedAt: component.usedAt,
          });
        });
        layer.append(label);

        const height = label.offsetHeight || 16;
        const width = label.offsetWidth || 60;
        let x = Math.max(0, rects[0].x);
        let y = rects[0].y >= height ? rects[0].y - height : rects[0].y;
        const overlaps = (a) =>
          placedLabels.some(
            (b) =>
              a.x < b.x + b.width &&
              b.x < a.x + a.width &&
              a.y < b.y + b.height &&
              b.y < a.y + a.height,
          );
        for (let tries = 0; tries < 12 && overlaps({ x, y, width, height }); tries += 1)
          x += width + 2;
        label.style.left = `${x}px`;
        label.style.top = `${y}px`;
        placedLabels.push({ x, y, width, height });
      }

      if (views.has("flash")) {
        for (const [id, rects] of flashing) {
          for (const rect of liveRects(id, rects)) {
            const flash = document.createElement("div");
            flash.className = "flash";
            place(flash, rect);
            layer.append(flash);
          }
        }
      }
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(draw);
    }

    function update(next) {
      commit = next;
      attach();
      for (const component of next.components) {
        if (!component.rendered || component.rects.length === 0) continue;
        flashing.set(component.id, component.rects);
        setTimeout(() => {
          if (flashing.get(component.id) === component.rects) {
            flashing.delete(component.id);
            schedule();
          }
        }, 700);
      }
      schedule();
    }

    addEventListener("scroll", schedule, { capture: true, passive: true });
    addEventListener("resize", schedule);
    addEventListener("message", (event) => {
      const message = event.data;
      if (event.source !== window.parent || message?.source !== "cs300-lab") return;
      if (message.runId !== lab.runId) return;
      if (message.type === "inspector-config" && Array.isArray(message.views)) {
        views = new Set(message.views);
        schedule();
      } else if (message.type === "inspector-highlight") {
        const ids = Array.isArray(message.componentIds)
          ? message.componentIds
          : [message.componentId].filter(Boolean);
        highlighted = new Set(ids);
        schedule();
      }
    });

    return { update };
  })();
}
