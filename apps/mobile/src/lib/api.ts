import { createApi } from "@repo/lib/api/api";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";

if (!import.meta.env.VITE_BASE_API_URL)
  throw new Error("VITE_BASE_API_URL is not defined");

const REFRESH_TOKEN_KEY = "refresh_token";
const JWT_KEY = "jwt";

const store = {
  get: async (key: string) => {
    const { value } = await SecureStoragePlugin.get({ key });
    return value;
  },
  insert: async (key: string, value: string) => {
    await SecureStoragePlugin.set({ key, value });
  },
  remove: async (key: string) => {
    await SecureStoragePlugin.remove({ key });
  },
};

let localJwt: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

async function getJwt() {
  try {
    // Get user's current JWT, prioritizing the local one
    let jwt = localJwt ?? (await store.get(JWT_KEY));

    // The user is not logged in
    if (!jwt) return null;

    const [, payloadBase64] = jwt.split(".");

    const payload =
      payloadBase64 &&
      (JSON.parse(
        atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/")),
      ) as unknown);

    if (
      !payload ||
      typeof payload !== "object" ||
      !("exp" in payload) ||
      typeof payload.exp !== "number"
    ) {
      // Invalid JWT, delete it and say the user is not logged in
      setJwt(null);
      return null;
    }

    // JWT is not expired
    if (payload.exp && Date.now() / 1000 < payload.exp) return jwt;

    if (refreshPromise) return await refreshPromise;

    async function refresh() {
      const refreshToken = await store.get(REFRESH_TOKEN_KEY);
      if (!refreshToken) return null;

      // Try to refresh the JWT
      const { error, data, code } = await api.sendRequest(
        "/users/refresh",
        {
          method: "post",
          payload: {
            jwt: jwt!,
            refreshToken,
          },
        },
        {
          omitCredentials: true,
        },
      );

      // Failed to refresh, either the user has mismatched claims or the refresh token is expired, log them out
      if (error || !data) {
        console.error(
          `Failed to refresh JWT (${code.toString()}):`,
          error?.message || "No response",
        );

        setJwt(null);
        setRefreshToken(null);
        refreshPromise = null;

        return null;
      }

      setRefreshToken(data.refreshToken);
      setJwt(data.jwt);
      refreshPromise = null;
      return data.jwt;
    }

    const promise = refresh();
    refreshPromise = promise;

    return await promise;
  } catch (error) {
    console.error("Failed to retrieve jwt:", error);
    return null;
  }
}

async function setJwt(jwt: string | null) {
  localJwt = jwt;

  try {
    if (jwt) {
      await store.insert(JWT_KEY, jwt);
    } else {
      await store.remove(JWT_KEY);
    }
  } catch (error) {
    console.error("Failed to save jwt:", error);
  }
}

async function setRefreshToken(refreshToken: string | null) {
  try {
    if (!refreshToken) {
      await store.remove(REFRESH_TOKEN_KEY);
      return;
    }

    await store.insert(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error("Failed to save refresh token:", error);
  }
}

export const api = createApi({
  baseUrl: import.meta.env.VITE_BASE_API_URL!,

  addAuthHeaders: async (req) => {
    req.headers ??= {};
    (req.headers as Record<string, string>).Authorization =
      `Bearer ${await getJwt()}`;

    return req;
  },

  isLoggedIn: async () => {
    const jwt = await getJwt(); // returns null if jwt is invalid or expired and cannot be refreshed
    return !!jwt;
  },

  isAdmin: async () => {
    const jwt = await getJwt(); // returns null if jwt is invalid or expired and cannot be refreshed
    if (!jwt) return false;

    const [, payloadBase64] = jwt.split(".");

    const payload =
      payloadBase64 &&
      (JSON.parse(
        atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/")),
      ) as unknown);

    if (
      !payload ||
      typeof payload !== "object" ||
      !("role" in payload) ||
      typeof payload.role !== "string"
    ) {
      return false;
    }

    return payload.role === "Admin";
  },

  login: async (api, username, password) => {
    const { isOk, data } = await api.sendRequest(
      "/users/login",
      {
        method: "post",
        payload: {
          username,
          password,
          useCookies: false,
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

    if (isOk && data) {
      setJwt(data.jwt);
      setRefreshToken(data.refreshToken);
    }

    return isOk;
  },

  logOut: async (api) => {
    const refreshToken = await store.get(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      await setJwt(null);
      return true;
    }

    const [{ isOk }] = await Promise.all([
      api.sendRequest(
        "/users/logout/token",
        {
          method: "post",
          payload: {
            refreshToken,
          },
        },
        {
          toasts: {
            loading: "Logging out...",
            success: "Successfully logged out.",
            error: (e: Error) => e.message || "Failed to log out.",
          },
        },
      ),
      setJwt(null),
      setRefreshToken(null),
    ]);

    return isOk;
  },
});
