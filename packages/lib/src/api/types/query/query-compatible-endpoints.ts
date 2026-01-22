import { GetEndpoints } from "../spec/get-endpoints";
import { SseEndpoints } from "../spec/sse-endpoints";
import { StreamProducerEndpoints } from "../spec/stream-producers";

export type QueryCompatibleEndpoints =
  | GetEndpoints
  | SseEndpoints
  | StreamProducerEndpoints;
