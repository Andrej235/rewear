import { RequestParameters } from "../request/parameters";
import { SseEndpoints } from "../spec/sse-endpoints";

export type SseStreamOptions<Endpoint extends SseEndpoints> = {
  omitCredentials?: boolean;
  abortSignal?: AbortSignal;
} & RequestParameters<Endpoint, "get">;
