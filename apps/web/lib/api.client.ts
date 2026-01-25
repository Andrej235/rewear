"use client";

import { Api, createApi } from "@repo/lib/api/api";

export const api = createApi({
  baseUrl: process.env.NEXT_PUBLIC_BASE_API_URL!,

  addAuthHeaders: async (headers) => {
    headers.credentials = "include";
    return headers;
  },

  isLoggedIn: async (api: Api) => {
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

  login: async (api, username, password) => {
    const { isOk } = await api.sendRequest(
      "/users/login",
      {
        method: "post",
        payload: {
          username,
          password,
          useCookies: true,
        },
      },
      {
        toasts: {
          success: "Logged in successfully",
          loading: "Logging in...",
          error: (e: Error) => e.message || "Failed to log in",
        },
      },
    );

    return isOk;
  },

  logOut: async (api) => {
    const { isOk } = await api.sendRequest(
      "/users/logout/cookie",
      {
        method: "post",
      },
      {
        toasts: {
          success: "Logged out successfully",
          loading: "Logging out...",
          error: (e) => e.message || "Failed to log out",
        },
      },
    );

    return isOk;
  },
});
