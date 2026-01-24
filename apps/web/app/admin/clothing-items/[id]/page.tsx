"use client";
import { useQuery } from "@repo/lib/api/use-query";
import { Button } from "@repo/ui/common/button";
import {
  PageAction,
  PageCard,
  PageContent,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@repo/ui/common/page-card";
import { LoadingScreen } from "@repo/ui/loading-screen";
import { Save } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { ClothingItemEditor } from "../../../../components/admin/clothing-item-editor";
import { api } from "../../../../lib/api.client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Schema } from "@repo/lib/api/types/schema/schema-parser";

export default function ClothingItemPage() {
  const { id } = useParams();
  const originalItem = useQuery(api, "/clothing-items/{id}", {
    queryKey: ["admin-clothing-item", id],
    parameters: {
      id: id as string,
    },
    enabled: !!id && typeof id === "string",
  });

  const [item, setItem] = useState<Schema<"CreateClothingItemRequestDto">>(
    null!,
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const changedData = useRef(false);
  const changedImage = useRef(false);

  useEffect(() => {
    if (!originalItem.data) return;
    setItem({ ...originalItem.data });
  }, [originalItem.data]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (changedData.current) {
      await api.sendRequest(
        "/clothing-items",
        {
          method: "put",
          payload: {
            ...item,
            id: originalItem.data!.id,
          },
        },
        {
          toasts: {
            success: "Clothing item updated successfully!",
            loading: "Updating clothing item...",
            error: (e) => e.message || "Failed to update clothing item.",
          },
        },
      );
    }

    if (changedImage.current && imageFile) {
      await api.sendRequest(
        "/clothing-items/{id}/image",
        {
          method: "patch",
          parameters: {
            id: originalItem.data!.id,
          },
        },
        {
          toasts: {
            success: "Clothing item image updated successfully!",
            loading: "Updating clothing item image...",
            error: (e) => e.message || "Failed to update clothing item image.",
          },
          modifyRequest: (req) => {
            const formData = new FormData();
            formData.append("imageStream", imageFile);

            delete (req.headers as Record<string, string>)["Content-Type"];

            req.body = formData;
            return req;
          },
        },
      );
    }
  }

  if (originalItem.isLoading) return <LoadingScreen />;
  if (!originalItem.data || originalItem.isError) return notFound();

  if (!item) return null;

  return (
    <form className="h-full w-full" onSubmit={handleSubmit}>
      <PageCard>
        <PageHeader>
          <PageTitle>New Clothing Item</PageTitle>
          <PageDescription>
            Create a new clothing item to be available in the store.
          </PageDescription>

          <PageAction>
            <Button type="submit">
              <span>Save</span>
              <Save className="ml-2" />
            </Button>
          </PageAction>
        </PageHeader>

        <PageContent>
          <ClothingItemEditor
            clothingItem={item}
            setClothingItem={(x) => {
              setItem(x);
              changedData.current = true;
            }}
            imageUrl={imageFile ? URL.createObjectURL(imageFile) : null}
            setImageFile={(file) => {
              setImageFile(file);
              changedImage.current = true;
            }}
          />
        </PageContent>
      </PageCard>
    </form>
  );
}
