import { cache } from "react";
import { getApi } from "./api.server";

export const getClothingItem = cache(async (id: string) => {
  const { data } = await getApi().sendRequest("/clothing-items/{id}", {
    method: "get",
    parameters: { id },
  });

  return data;
});
