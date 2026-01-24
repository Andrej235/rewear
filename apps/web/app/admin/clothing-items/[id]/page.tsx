"use client";
import { useQuery } from "@repo/lib/api/use-query";
import { useParams } from "next/navigation";
import { api } from "../../../../lib/api.client";

export default function ClothingItemPage() {
  const { id } = useParams();
  const item = useQuery(api, "/clothing-items/{id}", {
    queryKey: ["admin-clothing-item", id],
    parameters: {
      id: id as string,
    },
    enabled: !!id && typeof id === "string",
  });

  return <div>Clothing Item {item.data?.name}</div>;
}
