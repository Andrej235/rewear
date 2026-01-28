"use client";
import { Schema } from "@repo/lib/api/types/schema/schema-parser";
import { useQuery } from "@repo/lib/api/use-query";
import { useLeaveConfirmation } from "@repo/lib/hooks/use-leave-confirmation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/common/alert-dialog";
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
import { Layers, Save } from "lucide-react";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ClothingItemEditor } from "../../../../components/admin/clothing-item-editor";
import { api } from "../../../../lib/api.client";
import { useQueryClient } from "@tanstack/react-query";

export default function ClothingItemPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const originalItem = useQuery(api, "/clothing-items/{id}/admin", {
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
  useLeaveConfirmation(() => changedData.current || changedImage.current);
  const [confirmDiscardDialogOpen, setConfirmDiscardDialogOpen] =
    useState(false);

  useEffect(() => {
    if (!originalItem.data) return;
    setItem({ ...originalItem.data });
  }, [originalItem.data]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (changedData.current) {
      const { isOk } = await api.sendRequest(
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

      if (isOk) changedData.current = false;
    }

    if (changedImage.current && imageFile) {
      const { isOk } = await api.sendRequest(
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

      if (isOk) changedImage.current = false;
    }
  }

  const router = useRouter();
  function handleOpenInventoryEditor() {
    if (changedData.current || changedImage.current) {
      setConfirmDiscardDialogOpen(true);
      return;
    }

    router.push(`/admin/clothing-items/${id}/inventory`);
  }

  async function handleGenerateEmbedding() {
    const { isOk } = await api.sendRequest(
      "/clothing-items/{id}/generate-embedding",
      {
        method: "post",
        parameters: {
          id: originalItem.data!.id,
        },
      },
      {
        toasts: {
          success: "Embedding generation started successfully!",
          loading: "Starting embedding generation...",
          error: (e) => e.message || "Failed to start embedding generation.",
        },
      },
    );

    if (!isOk) return;

    queryClient.setQueryData(
      ["admin-clothing-item", id],
      (oldData: Schema<"AdminClothingItemResponseDto">) => ({
        ...oldData,
        lastEmbeddingGeneratedAt: new Date().toISOString(),
      }),
    );
  }

  if (originalItem.isLoading) return <LoadingScreen />;
  if (!originalItem.data || originalItem.isError) return notFound();

  if (!item) return null;

  return (
    <form className="h-full w-full" onSubmit={handleSubmit}>
      <PageCard>
        <PageHeader>
          <PageTitle>Edit "{originalItem.data.name}"</PageTitle>
          <PageDescription>
            Modify the details of this clothing item.
          </PageDescription>

          <PageAction className="space-x-2">
            <Button
              variant="secondary"
              onClick={handleOpenInventoryEditor}
              type="button"
            >
              <span>Edit Inventory</span>
              <Layers className="ml-2" />
            </Button>

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
            editor
            lastEmbeddingDate={originalItem.data.lastEmbeddingGeneratedAt}
            handleGenerateEmbedding={handleGenerateEmbedding}
          />
        </PageContent>
      </PageCard>

      <AlertDialog
        open={confirmDiscardDialogOpen}
        onOpenChange={setConfirmDiscardDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
            <AlertDialogDescription>
              All unsaved changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link href={`/admin/clothing-items/${id}/inventory`}>Leave</Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}
