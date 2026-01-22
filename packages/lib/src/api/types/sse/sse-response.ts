import { ParseSchemaProperty } from "../schema/property-parser";
import { Endpoints, Methods, Paths } from "../spec/endpoints";
import { IsCodeOk } from "../utility/is-code-ok";
import { SseEndpoints } from "../spec/sse-endpoints";

export type SseResponse<Endpoint extends SseEndpoints> =
  Paths[Endpoint]["get"] extends {
    responses: infer Responses;
  }
    ? ParseSseResponse<Responses[IsCodeOk<keyof Responses>]>
    : never;

type ParseSseResponse<Response> = Response extends {
  content: {
    "text/event-stream": {
      schema: infer Schema;
    };
  };
}
  ? ParseSchemaProperty<Schema>
  : never;

type ConsumerResponsePath<Consumer> = Consumer extends {
  path: infer Path;
  method: infer Method;
}
  ? Method extends "get"
    ? Path extends SseEndpoints
      ? Path
      : never
    : never
  : never;

type StreamConsumers<
  Endpoint extends Endpoints,
  Method extends Methods<Endpoint>,
> = Paths[Endpoint][Method] extends {
  "x-stream": {
    role: "producer";
    consumers: infer Consumers;
  };
}
  ? Consumers
  : never;

export type StreamConsumerPaths<
  Endpoint extends Endpoints,
  Method extends Methods<Endpoint>,
> = ParseConsumerPaths<StreamConsumers<Endpoint, Method>>;

type ParseConsumerPaths<Consumers> = Consumers extends [
  infer First,
  ...infer Rest,
]
  ? ConsumerResponsePath<First> | ParseConsumerPaths<Rest>
  : never;

export type ProducesSseStreamConsumerResponse<
  Endpoint extends Endpoints,
  Method extends Methods<Endpoint>,
> = SseResponse<ParseConsumerPaths<StreamConsumers<Endpoint, Method>>>;
