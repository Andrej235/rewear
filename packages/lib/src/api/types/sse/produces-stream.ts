import { Endpoints, Methods, Paths } from "../spec/endpoints";

export type ProducesStream<
  Endpoint extends Endpoints,
  Method extends Methods<Endpoint>,
> = Paths[Endpoint][Method] extends {
  "x-stream": {
    role: "producer";
    consumers: [unknown];
  };
}
  ? true
  : never;
