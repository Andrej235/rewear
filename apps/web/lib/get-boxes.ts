import { cache } from "react";
import { getApi } from "./api.server";

export const getBoxes = cache(async () => {
  const { data } = await getApi().sendRequest("/delivery-boxes/previews", {
    method: "get",
  });

  return data;
});
