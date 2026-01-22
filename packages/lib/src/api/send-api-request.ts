import { apiResponseToToast } from "../utils/toast-promise";
import { Api } from "./api";
import { getSseStream } from "./get-sse-stream";
import { parseUrl } from "./parse-url";
import { Request } from "./types/request/request";
import { Response } from "./types/response/response";
import { Endpoints } from "./types/spec/endpoints";
import { SseEndpoints } from "./types/spec/sse-endpoints";
import { Exact } from "./types/utility/exact";

export type SendRequestOptions = {
  omitCredentials?: boolean;
  abortSignal?: AbortSignal;
  modifyRequest?: (request: RequestInit) => RequestInit | Promise<RequestInit>;
  addAuthHeaders: (request: RequestInit) => RequestInit | Promise<RequestInit>;
  toasts?: {
    loading: string;
    success: string;
    error: (error: Error) => string;
  };
};

export function sendApiRequest<
  const TEndpoint extends Endpoints,
  const TRequest extends Request<TEndpoint>,
>(
  api: Api,
  endpoint: TEndpoint,
  request: Exact<TRequest, Request<TEndpoint>>,
  options: SendRequestOptions,
): Promise<Response<TEndpoint, TRequest>> & {
  cancel: () => void;
} {
  const abortController = new AbortController();

  if (options.abortSignal) {
    options.abortSignal.addEventListener("abort", () => {
      abortController.abort();
    });
  }

  const response: ReturnType<typeof sendApiRequest> = innerSendApiRequest(
    api,
    endpoint,
    request,
    {
      ...options,
      abortSignal: abortController.signal,
    },
  );
  response.cancel = () => abortController.abort();

  return response;
}

async function innerSendApiRequest<
  TEndpoint extends Endpoints,
  TRequest extends Request<TEndpoint>,
>(
  api: Api,
  endpoint: TEndpoint,
  request: Exact<TRequest, Request<TEndpoint>>,
  options: SendRequestOptions,
): Promise<Response<TEndpoint, TRequest>> {
  const url = parseUrl(
    api.baseUrl,
    endpoint,
    "parameters" in request && typeof request.parameters === "object"
      ? (request.parameters as Record<string, string>)
      : null,
  );

  const body = "payload" in request ? JSON.stringify(request.payload) : null;

  let requestInit: RequestInit = {
    method: (request.method as string).toUpperCase(),
    signal: options.abortSignal ?? null,
    body: body,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (!options.omitCredentials) await options.addAuthHeaders(requestInit);

  if (options.modifyRequest)
    requestInit = await options.modifyRequest(requestInit);

  const responsePromise = (async () => {
    const response = await fetch(url, requestInit);
    const code = response.status.toString();
    const isOk = response.ok;
    let data = null;

    try {
      data = await response.json();
      // eslint-disable-next-line no-empty
    } catch {}

    const mappedResponse: Response<TEndpoint, TRequest> = {
      code,
      isOk,
      error: isOk ? null : data,
      data: isOk ? data : null,
    } as unknown as Response<TEndpoint, TRequest>;

    if ("followStream" in request && request.followStream) {
      const location = response.headers.get("location");

      if (location) {
        (mappedResponse as Record<string, unknown>).stream = getSseStream(
          api,
          location as SseEndpoints,
          { ...options, parameters: null! },
        );
      }
    }

    return mappedResponse;
  })();

  if (options.toasts) apiResponseToToast(responsePromise, options.toasts);

  return await responsePromise;
}
