import { Api, createApi } from "@repo/lib/api/api";
import { cookies } from "next/headers";
import { cache } from "react";

const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL!;
if (!baseUrl)
  throw new Error("Missing NEXT_PUBLIC_BASE_API_URL environment variable");

export const getApi = cache(() =>
  createApi({
    baseUrl,
    addAuthHeaders: async (req) => {
      req.credentials = "include";
      const allCookies = (await cookies())
        .getAll()
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; ");

      if (req.headers)
        (req.headers as Record<string, string>)["Cookie"] = allCookies;
      else req.headers = { Cookie: allCookies };

      return req;
    },

    isLoggedIn: async (api) => {
      const { isOk } = await api.sendRequest("/users/check-auth", {
        method: "get",
      });

      return isOk;
    },

    isAdmin: async (api: Api) => {
      const { isOk } = await api.sendRequest("/users/check-auth-admin", {
        method: "get",
      });

      return isOk;
    },

    login: async () => {
      throw new Error("Not implemented on server");
    },
    logOut: async () => {
      throw new Error("Not implemented on server");
    },
  }),
);
