import { SseError } from "./sse-error";
import { SseMessage } from "./sse-message";

export type SseEvent<T> = SseMessage<T> | SseError;
