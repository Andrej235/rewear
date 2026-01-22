import { cache } from "react";
import { getApi } from "./api.server";

export const getUser = cache(async () => {
  const { data: user } = await getApi().sendRequest("/users/me", {
    method: "get",
  });

  return user;
});
