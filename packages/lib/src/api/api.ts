import { sendApiRequest, SendRequestOptions } from "./send-api-request";
import { Request } from "./types/request/request";
import { Response } from "./types/response/response";
import { Endpoints } from "./types/spec/endpoints";
import { Exact } from "./types/utility/exact";

type Config = {
  baseUrl: string;

  addAuthHeaders: (request: RequestInit) => Promise<RequestInit>;
  login: (api: Api, username: string, password: string) => Promise<boolean>;
  logOut: (api: Api) => Promise<boolean>;
  isLoggedIn: (api: Api) => Promise<boolean>;
};

export type Api = {
  baseUrl: string;
  sendRequest: <
    const TEndpoint extends Endpoints,
    const TRequest extends Request<TEndpoint>,
  >(
    endpoint: TEndpoint,
    request: Exact<TRequest, Request<TEndpoint>>,
    options?: Omit<SendRequestOptions, "addAuthHeaders">,
  ) => Promise<Response<TEndpoint, TRequest>> & {
    cancel: () => void;
  };

  login: (username: string, password: string) => Promise<boolean>;
  logOut: () => Promise<boolean>;
  isLoggedIn: () => Promise<boolean>;
  addAuthHeaders: (request: RequestInit) => Promise<RequestInit>;
};

export function createApi(config: Config): Api {
  config.baseUrl = config.baseUrl.replace(/\/+$/, ""); // Remove trailing slashes

  const api: Api = {
    baseUrl: config.baseUrl,
    sendRequest: (endpoint, req, opts = {}) => {
      return sendApiRequest(api, endpoint, req, {
        ...opts,
        addAuthHeaders: config.addAuthHeaders,
      });
    },

    login: (username, password) => config.login(api, username, password),
    logOut: () => config.logOut(api),
    isLoggedIn: () => config.isLoggedIn(api),
    addAuthHeaders: config.addAuthHeaders,
  };

  return api;
}
