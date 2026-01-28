import { cache } from "react";
import { getApi } from "./api.server";

export const getLatestBox = cache(async () => {
  const { data } = await getApi().sendRequest("/delivery-boxes/latest", {
    method: "get",
  });

  return data;
});
