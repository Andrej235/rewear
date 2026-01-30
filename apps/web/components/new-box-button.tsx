"use client";
import { Button } from "@repo/ui/common/button";
import { api } from "../lib/api.client";
import { useRouter } from "next/navigation";

export function NewBoxButton() {
  const router = useRouter();

  async function handleCreate() {
    const { isOk } = await api.sendRequest(
      "/delivery-boxes",
      {
        method: "post",
      },
      {
        toasts: {
          success: "New box created successfully!",
          loading: "Creating new box...",
          error: (e) => e.message || "Failed to create a new box.",
        },
      },
    );

    if (!isOk) return;
    router.push("/boxes/latest");
  }

  return <Button onClick={handleCreate}>Create New Box</Button>;
}
