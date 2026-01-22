import { Endpoints, Methods, Paths } from "./endpoints";
import { IsCodeOk } from "../utility/is-code-ok";

type HasSseResponse<
  Endpoint extends Endpoints,
  Method extends Methods<Endpoint>,
> = Paths[Endpoint][Method] extends {
  responses: infer Responses;
}
  ? Responses[IsCodeOk<keyof Responses>] extends {
      content: infer T;
    }
    ? T extends unknown
      ? T extends {
          "text/event-stream": unknown;
        }
        ? true
        : never
      : never
    : never
  : never;

type ExtractSseEndpoints<E extends Endpoints> = E extends unknown
  ? "get" extends Methods<E>
    ? HasSseResponse<E, "get"> extends never
      ? never
      : E
    : never
  : never;

export type SseEndpoints = ExtractSseEndpoints<Endpoints>;
