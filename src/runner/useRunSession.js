import { useCallback, useEffect, useRef, useState } from "react";
import { buildRun } from "./index.js";
import { loadIndex } from "../app/content.js";

export const FIXTURES_BASE = "https://fixtures.local";

export function resolveApiBase(apiSource, presets = []) {
  if (!apiSource || apiSource.kind === "fixtures") return FIXTURES_BASE;
  if (apiSource.kind === "preset") {
    return presets.find((preset) => preset.id === apiSource.id)?.baseUrl ?? FIXTURES_BASE;
  }
  return (apiSource.baseUrl ?? "").trim().replace(/\/+$/, "");
}

export function isReactWorkspace(files) {
  return Object.entries(files ?? {}).some(
    ([path, source]) =>
      /\.(jsx?|mjs)$/.test(path) &&
      /\b(?:from|import)\s*["']react(?:-dom)?(?:\/[\w-]+)?["']/.test(source),
  );
}

async function loadPresets() {
  const index = await loadIndex();
  return index.status === "ok" ? (index.data.presets ?? []) : [];
}

const EMPTY = {
  status: "idle",
  diagnostics: [],
  consoleEntries: [],
  errors: [],
  checkResults: null,
  inspectorCommits: [],
  networkRequests: [],
  runId: null,
};

export function useRunSession({ step, files, apiSource, fixtureControls }) {
  const iframeRef = useRef(null);
  const currentRun = useRef(null);
  const runToken = useRef(0);
  const latest = useRef({ step, files, apiSource, fixtureControls });
  const [state, setState] = useState(EMPTY);

  useEffect(() => {
    latest.current = { step, files, apiSource, fixtureControls };
  });

  const send = useCallback((message) => {
    const run = currentRun.current;
    const target = iframeRef.current?.contentWindow;
    if (!run || !target) return;
    target.postMessage({ ...message, source: "cs300-lab", runId: run.runId }, "*");
  }, []);

  const run = useCallback(async () => {
    const {
      step: currentStep,
      files: currentFiles,
      apiSource: source,
      fixtureControls: controls,
    } = latest.current;
    if (!currentStep?.entry || !currentFiles) return;
    const token = ++runToken.current;
    currentRun.current?.dispose();
    currentRun.current = null;
    setState({ ...EMPTY, status: "compiling" });

    const presets = await loadPresets();
    if (token !== runToken.current) return;
    const built = buildRun({
      files: currentFiles,
      entry: currentStep.entry,
      runtimeBase: import.meta.env.BASE_URL + "runtime/",
      env: { API_BASE: resolveApiBase(source, presets) },
      fixtures: currentStep.fixtures ?? null,
      fixtureControls: controls,
      check: currentStep.check ?? null,
      inspector: isReactWorkspace(currentFiles),
    });
    currentRun.current = built;

    if (built.diagnostics.length > 0 || !built.srcdoc) {
      setState({
        ...EMPTY,
        status: "compile-error",
        diagnostics: built.diagnostics,
        runId: built.runId,
      });
      return;
    }
    setState({ ...EMPTY, status: "running", runId: built.runId });
    if (iframeRef.current) iframeRef.current.srcdoc = built.srcdoc;
  }, []);

  const runChecks = useCallback(() => send({ type: "run-checks" }), [send]);

  useEffect(() => {
    function onMessage(event) {
      const message = event.data;
      const run = currentRun.current;
      if (!message || message.source !== "cs300-lab" || !run || message.runId !== run.runId) return;
      if (iframeRef.current && event.source !== iframeRef.current.contentWindow) return;

      setState((previous) => {
        if (previous.runId !== message.runId) return previous;
        switch (message.type) {
          case "console":
            return {
              ...previous,
              consoleEntries: [
                ...previous.consoleEntries,
                {
                  level: message.level,
                  text: message.text,
                  args: message.args,
                  time: message.time,
                },
              ],
            };
          case "error":
            return {
              ...previous,
              errors: [
                ...previous.errors,
                {
                  message: message.message,
                  stack: message.stack,
                  file: message.file,
                  line: message.line,
                  column: message.column,
                },
              ],
            };
          case "rejection":
            return {
              ...previous,
              errors: [...previous.errors, { message: message.message, stack: message.stack }],
            };
          case "settled":
            return { ...previous, status: "settled" };
          case "check-results":
            return { ...previous, checkResults: message.results ?? [] };
          case "check-error":
            return {
              ...previous,
              checkResults: [
                {
                  id: "check-error",
                  title: "The checks could not run",
                  pass: false,
                  hint: message.message,
                },
              ],
            };
          case "inspector":
            return {
              ...previous,
              inspectorCommits: [...previous.inspectorCommits, message.commit],
            };
          case "network": {
            const request = message.request;
            const known = previous.networkRequests.some((entry) => entry.id === request.id);
            return {
              ...previous,
              networkRequests: known
                ? previous.networkRequests.map((entry) =>
                    entry.id === request.id ? request : entry,
                  )
                : [...previous.networkRequests, request],
            };
          }
          default:
            return previous;
        }
      });
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (state.status !== "running" && state.status !== "settled") return;
    let cancelled = false;
    loadPresets().then((presets) => {
      if (cancelled) return;
      send({
        type: "set-api",
        env: { API_BASE: resolveApiBase(apiSource, presets) },
        fixtureControls,
      });
    });
    return () => {
      cancelled = true;
    };
    // Re-sent only when the API choice changes, not on every status change of the same run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiSource, fixtureControls, send]);

  useEffect(
    () => () => {
      currentRun.current?.dispose();
      currentRun.current = null;
    },
    [],
  );

  return {
    iframeRef,
    run,
    runChecks,
    status: state.status,
    diagnostics: state.diagnostics,
    consoleEntries: state.consoleEntries,
    errors: state.errors,
    checkResults: state.checkResults,
    inspectorCommits: state.inspectorCommits,
    latestCommit: state.inspectorCommits.at(-1) ?? null,
    networkRequests: state.networkRequests,
    send,
    runId: state.runId,
  };
}
