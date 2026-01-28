import { Endpoints } from "./types/spec/endpoints";

export function parseUrl(
  baseUrl: string,
  route: Endpoints,
  parameters: Record<string, unknown> | null,
): URL {
  const url = new URL(baseUrl + route);
  if (!parameters) return url;

  // shallow copy, just so we can use delete
  parameters = { ...parameters };

  for (const key in parameters) {
    // optional properties might be set to undefined instead of being omitted
    if (parameters[key] === undefined) {
      delete parameters[key];
      continue;
    }

    if (!url.href.includes("%7B" + key + "%7D")) continue;

    const value = parameters[key];
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    )
      url.href = url.href.replace("%7B" + key + "%7D", value.toString());

    delete parameters[key];
  }

  const searchParams = new URLSearchParams();
  for (const key in parameters) {
    const value = parameters[key];

    if (typeof value === "object" && Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, v));
    } else searchParams.append(key, String(value));
  }

  url.search = searchParams.toString();
  return url;
}
