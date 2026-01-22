import { ProducesStream } from "../sse/produces-stream";
import { Endpoints, Methods } from "./endpoints";

type ExtractStreamProducers<Endpoint extends Endpoints> =
  Endpoint extends unknown
    ? ProducesStream<Endpoint, Methods<Endpoint>> extends never
      ? never
      : Endpoint
    : never;

export type StreamProducerEndpoints = ExtractStreamProducers<Endpoints>;
