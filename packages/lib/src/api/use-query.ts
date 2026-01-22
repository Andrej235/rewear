import { useQuery as useTanQuery } from "@tanstack/react-query";
import { Exact } from "../api/types/utility/exact";
import { Api } from "./api";
import { getSseStream } from "./get-sse-stream";
import { QueryCompatibleEndpoints } from "./types/query/query-compatible-endpoints";
import { QueryOptions } from "./types/query/query-options";
import { QueryResponse } from "./types/query/query-response";
import { Request } from "./types/request/request";
import { SseEndpoints } from "./types/spec/sse-endpoints";

export function useQuery<
  const TRoute extends QueryCompatibleEndpoints,
  const TOptions extends QueryOptions<TRoute>,
>(
  api: Api,
  route: TRoute,
  options?: Exact<TOptions, QueryOptions<TRoute>>,
): QueryResponse<TRoute, TOptions> {
  return useTanQuery({
    queryFn: async () => {
      if (options && "stream" in options) {
        // @ts-ignore this can cause type errors if no api endpoints are setup for sse
        return getSseStream(api, route as SseEndpoints, options);
      }

      const req = await api.sendRequest(
        route,
        options && "method" in options
          ? (options as unknown as Exact<Request<TRoute>, Request<TRoute>>)
          : ({
              method: "get",
              ...options,
            } as unknown as Exact<Request<TRoute>, Request<TRoute>>),
        {
          abortSignal: options?.abortSignal,
          omitCredentials: options?.omitCredentials,
          toasts: options?.toasts,
          modifyRequest: options?.modifyRequest,
        },
      );

      if (!req?.isOk)
        throw new Error(req?.error?.message ?? "Something went wrong");

      if (options && "method" in options) {
        if ("stream" in req) return req.stream;
        throw new Error(req?.error?.message ?? "Something went wrong");
      }

      return req.data;
    },
    refetchOnWindowFocus: false,
    retry: options?.retry ?? false,
    ...options,
    queryKey: options?.queryKey ?? [route],
  }) as QueryResponse<TRoute, TOptions>;
}
