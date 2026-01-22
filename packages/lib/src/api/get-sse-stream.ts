import { EventSource } from "eventsource";
import { Api } from "./api";
import { parseUrl } from "./parse-url";
import { StreamResponse } from "./types/response/stream-response";
import { SseEndpoints } from "./types/spec/sse-endpoints";
import { SseEvent } from "./types/sse/sse-event";
import { SseResponse } from "./types/sse/sse-response";
import { SseStreamOptions } from "./types/sse/sse-stream-options";

export function getSseStream<Endpoint extends SseEndpoints>(
  api: Api,
  url: Endpoint,
  options: SseStreamOptions<Endpoint>,
): StreamResponse<Endpoint> {
  type EventType = SseEvent<SseResponse<Endpoint>>;
  const abortController = new AbortController();

  if (options.abortSignal) {
    options.abortSignal.addEventListener("abort", () => {
      abortController.abort();
    });
  }

  return {
    [Symbol.asyncIterator](): AsyncIterator<EventType> {
      const queue: EventType[] = [];
      let push: (() => void) | null = null;
      let done = false;

      let eventSource: EventSource;
      console.log("opening connection");

      eventSource = new EventSource(
        parseUrl(
          api.baseUrl,
          url,
          "parameters" in options
            ? (options.parameters as Record<string, string>)
            : null,
        ),
        {
          fetch: async (input, init) => {
            let request: RequestInit = {
              ...init,
              signal: abortController.signal,
              headers: {
                ...init.headers,
              },
            };

            if (!options.omitCredentials)
              request = await api.addAuthHeaders(request);

            return await fetch(input, request);
          },
          withCredentials: !options.omitCredentials,
        },
      );

      // Normal messages
      eventSource.onmessage = (event: MessageEvent) => {
        queue.push({ type: "message", data: event.data });
        if (push) {
          push();
          push = null;
        }
      };

      // Error handling
      eventSource.onerror = (err: Event) => {
        queue.push({ type: "error", error: err });
        done = true;
        eventSource.close();
        if (push) {
          push();
          push = null;
        }
      };

      return {
        async next(): Promise<IteratorResult<EventType>> {
          if (queue.length > 0) {
            return { value: queue.shift()!, done: false };
          }
          if (done) {
            return { value: null, done: true };
          }

          return new Promise<IteratorResult<EventType>>((resolve) => {
            push = () => {
              if (queue.length > 0) {
                resolve({ value: queue.shift()!, done: false });
              } else {
                resolve({ value: null, done: true });
              }
            };
          });
        },

        return(): Promise<IteratorResult<EventType>> {
          done = true;
          console.log("Closing SSE connection");
          eventSource.close();
          return Promise.resolve({ value: null, done: true });
        },
      };
    },
    cancel: () => abortController.abort(),
  } as StreamResponse<Endpoint>;
}
