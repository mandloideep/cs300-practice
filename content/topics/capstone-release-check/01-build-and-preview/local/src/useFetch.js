import { useEffect, useState } from "react";
import { loadJson } from "./api.js";

export function useFetch(url) {
  const [attempt, setAttempt] = useState(0);
  const [request, setRequest] = useState({ status: "loading", data: null, error: null });

  useEffect(() => {
    const controller = new AbortController();
    setRequest({ status: "loading", data: null, error: null });
    loadJson(url, controller.signal)
      .then((data) => {
        setRequest({ status: "success", data, error: null });
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setRequest({ status: "error", data: null, error });
        }
      });
    return () => controller.abort();
  }, [url, attempt]);

  function retry() {
    setAttempt(attempt + 1);
  }

  return { status: request.status, data: request.data, error: request.error, retry };
}
