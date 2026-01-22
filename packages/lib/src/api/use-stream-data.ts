import { useEffect, useState } from "react";
import { TanStackQueryResponse } from "./types/query/query-response";
import { SseEvent } from "./types/sse/sse-event";

type InputStream<T> = AsyncIterable<SseEvent<T>>;

export function useStreamData<TData>(
  stream:
    | InputStream<TData>
    | TanStackQueryResponse<InputStream<TData>>
    | undefined
    | null,
): TData[] {
  const [resolvedData, setResolvedData] = useState<TData[]>([]);
  const iterator = !stream ? null : "data" in stream ? stream.data : stream;

  useEffect(() => {
    if (!iterator) return;

    let stopped = false;

    (async () => {
      setResolvedData([]);

      if (!iterator) {
        stopped = true;
        return;
      }

      for await (const current of iterator) {
        if (current.type === "error") continue;
        if (stopped) return;

        setResolvedData((prev) => [...prev, current.data]);
      }
    })();

    return () => void (stopped = true);
  }, [iterator]);

  return resolvedData;
}
