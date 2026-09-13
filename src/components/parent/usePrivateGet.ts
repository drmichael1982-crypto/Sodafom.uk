import { useEffect, useState } from "react";
import { API_PREFIX } from "@/lib/config";

/**
 * A small private-read hook for account data. It does not cache child data in
 * browser storage and drops/aborts a response when the selected child changes.
 */
export function usePrivateGet<T>(path: string, parse: (value: unknown) => T) {
  const [revision, setRevision] = useState(0);
  const key = `${path}:${revision}`;
  const [state, setState] = useState<{
    key: string;
    data: T | null;
    error: string;
    loading: boolean;
  }>({
    key: "",
    data: null,
    error: "",
    loading: true,
  });

  useEffect(() => {
    let active = true;
    let timedOut = false;
    const controller = new AbortController();
    setState({ key, data: null, error: "", loading: true });
    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 20_000);

    void (async () => {
      try {
        const response = await fetch(`${API_PREFIX}${path}`, {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? "Your session has ended. Please sign in again."
              : response.status === 403 || response.status === 404
                ? "This information is not available to this account."
                : "Information could not be loaded. Please try again.",
          );
        }
        const data = parse(await response.json());
        if (active) setState({ key, data, error: "", loading: false });
      } catch (error) {
        if (active) {
          setState({
            key,
            data: null,
            loading: false,
            error: timedOut
              ? "The request took too long. Please try again."
              : error instanceof Error && !(error instanceof SyntaxError)
                ? error.message
                : "The response could not be read. Please try again.",
          });
        }
      } finally {
        window.clearTimeout(timeout);
      }
    })();

    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [path, key, parse]);

  // A stale request must never render a previous child or period's data.
  const current =
    state.key === key ? state : { data: null, error: "", loading: true };
  return { ...current, reload: () => setRevision((value) => value + 1) };
}
