import type { useQuery as useTanQuery } from "@tanstack/react-query";
import { StreamResponse } from "../response/stream-response";
import { UnwrappedRestResponse } from "../rest/rest-response";
import { Methods } from "../spec/endpoints";
import { GetEndpoints } from "../spec/get-endpoints";
import { SseEndpoints } from "../spec/sse-endpoints";
import { StreamProducerEndpoints } from "../spec/stream-producers";
import { StreamConsumerPaths } from "../sse/sse-response";
import { QueryCompatibleEndpoints } from "./query-compatible-endpoints";
import { QueryOptions } from "./query-options";

export type TanStackQueryResponse<T> = ReturnType<typeof useTanQuery<T>>;

export type QueryResponse<
  TRoute extends QueryCompatibleEndpoints,
  TOptions extends QueryOptions<TRoute>,
> = TRoute extends GetEndpoints
  ? TanStackQueryResponse<UnwrappedRestResponse<TRoute, "get">>
  : TRoute extends SseEndpoints
    ? TanStackQueryResponse<StreamResponse<TRoute>>
    : TRoute extends StreamProducerEndpoints
      ? TOptions extends {
          method: infer Method;
        }
        ? Method extends Methods<TRoute>
          ? TanStackQueryResponse<
              StreamResponse<StreamConsumerPaths<TRoute, Method>>
            >
          : never
        : never
      : never;
