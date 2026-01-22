import { Endpoints } from "./types/spec/endpoints";

export function parseUrl(
  baseUrl: string,
  route: Endpoints,
  parameters: Record<string, string> | null,
): URL {
  const url = new URL(baseUrl + route);
  if (!parameters) return url;

  // shallow copy, just so we can use delete
  parameters = { ...parameters };

  for (const key in parameters) {
    if (!url.href.includes("%7B" + key + "%7D")) continue;

    const value = parameters[key];
    if (value !== undefined)
      url.href = url.href.replace("%7B" + key + "%7D", value);

    delete parameters[key];
  }

  url.search = new URLSearchParams(parameters).toString();

  return url;
}
