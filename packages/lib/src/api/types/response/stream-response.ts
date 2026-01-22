import { SseEndpoints } from "../spec/sse-endpoints";
import { SseEvent } from "../sse/sse-event";
import { SseResponse } from "../sse/sse-response";

export type StreamResponse<Endpoint> = Endpoint extends unknown
  ? Endpoint extends SseEndpoints
    ? AsyncIterable<SseEvent<SseResponse<Endpoint>>> & {
        cancel: () => void;
      }
    : never
  : never;
