"use client";
import { Schema } from "@repo/lib/api/types/schema/schema-parser";
import { Button } from "@repo/ui/common/button";
import {
  PageAction,
  PageCard,
  PageContent,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@repo/ui/common/page-card";
import { useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ClothingItemEditor } from "../../../../components/admin/clothing-item-editor";
import { api } from "../../../../lib/api.client";

export default function NewClothingItemPage() {
  const [item, setItem] = useState<Schema<"CreateClothingItemRequestDto">>({
    name: "",
    description: "",

    category: "none",
    genderTarget: "none",

    primaryStyle: "none",
    secondaryStyles: [],

    colors: [],
    fitType: "none",
    season: "all",

    material: "none",
    brandName: "",

    isActive: false,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const router = useRouter();
  const queryClient = useQueryClient();
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { isOk, data } = await api.sendRequest(
      "/clothing-items",
      {
        method: "post",
        payload: item,
      },
      {
        toasts: {
          success: "Clothing item created successfully!",
          loading: "Creating clothing item...",
          error: (e) => e.message || "Failed to create clothing item.",
        },
      },
    );

    if (!isOk || !data) return;

    if (imageFile) {
      await api.sendRequest(
        "/clothing-items/{id}/image",
        {
          method: "patch",
          parameters: {
            id: data.id,
          },
        },
        {
          toasts: {
            success: "Image uploaded successfully!",
            loading: "Uploading image...",
            error: (e) => e.message || "Failed to upload image.",
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

    router.push(`/admin/clothing-items/${data.id}`);
    queryClient.invalidateQueries({
      queryKey: ["admin-clothing-items"],
      exact: true,
    });
    console.log(item);
  };

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
            setClothingItem={setItem}
            imageUrl={imageFile ? URL.createObjectURL(imageFile) : null}
            setImageFile={setImageFile}
          />
        </PageContent>
      </PageCard>
    </form>
  );
}
