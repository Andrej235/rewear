import { RefToSchemaName, SchemaFromString } from "../schema/schema-parser";
import { Endpoints, Methods, Paths } from "../spec/endpoints";
import { ProducesStream } from "../sse/produces-stream";
import { RequestParameters } from "./parameters";

export type Request<Endpoint extends Endpoints> = RequestHelper<
  Endpoint,
  keyof Paths[Endpoint]
>;

type RequestHelper<
  Path extends keyof Paths,
  Key extends keyof Paths[Path],
> = Key extends unknown
  ? {
      method: Key;
    } & RequestParameters<Path, Key> &
      Payload<Path, Key> &
      SseConfig<Path, Key>
  : never;

type Payload<
  Path extends keyof Paths,
  Method extends keyof Paths[Path],
> = Paths[Path][Method] extends {
  requestBody: {
    content: {
      "application/json": {
        schema: {
          $ref: infer SchemaName;
        };
      };
    };
  };
}
  ? SchemaName extends string
    ? { payload: SchemaFromString<RefToSchemaName<SchemaName>> }
    : object
  : object;

type SseConfig<Path extends Endpoints, Method extends Methods<Path>> =
  ProducesStream<Path, Method> extends never
    ? object
    : { followStream?: boolean };
