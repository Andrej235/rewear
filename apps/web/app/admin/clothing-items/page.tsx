"use client";
import { Schema } from "@repo/lib/api/types/schema/schema-parser";
import { useQuery } from "@repo/lib/api/use-query";
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
import { Badge } from "@repo/ui/common/badge";
import { Button } from "@repo/ui/common/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/common/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@repo/ui/common/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/common/dropdown-menu";
import {
  PageAction,
  PageCard,
  PageContent,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@repo/ui/common/page-card";
import { Separator } from "@repo/ui/common/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/common/tooltip";
import { LoadingScreen } from "@repo/ui/loading-screen";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dot,
  Edit2,
  EllipsisVertical,
  Layers,
  Plus,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { api } from "../../../lib/api.client";

export default function ClothingItemsPage() {
  const client = useQueryClient();
  const items = useQuery(api, "/clothing-items/all", {
    queryKey: ["admin-clothing-items"],
  });

  const [deletingItem, setDeletingItem] =
    useState<Schema<"AdminClothingItemResponseDto"> | null>(null);

  async function handleDelete() {
    if (!deletingItem) return;

    const { isOk } = await api.sendRequest(
      "/clothing-items/{id}",
      {
        method: "delete",
        parameters: {
          id: deletingItem.id,
        },
      },
      {
        toasts: {
          success: "Clothing item deleted successfully!",
          loading: "Deleting clothing item...",
          error: (e) => e.message || "Failed to delete clothing item.",
        },
      },
    );

    if (!isOk) return;

    client.setQueryData(
      ["admin-clothing-items"],
      (oldData?: Schema<"AdminClothingItemResponseDto">[]) =>
        oldData?.filter((item) => item.id !== deletingItem.id) || [],
    );
    setDeletingItem(null);
  }

  if (items.isLoading) return <LoadingScreen />;

  return (
    <PageCard>
      <PageHeader>
        <PageTitle>Clothing Items</PageTitle>
        <PageDescription>
          Manage all clothing items available in the store.
        </PageDescription>

        <PageAction>
          <Button asChild>
            <Link href="/admin/clothing-items/new">
              <span>New</span>
              <Plus className="ml-2" />
            </Link>
          </Button>
        </PageAction>
      </PageHeader>

      <PageContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.data?.map((item) => (
            <ContextMenu key={item.id}>
              <ContextMenuTrigger>
                <Card className="min-h-full gap-4 border-2 border-primary/40 pt-0 transition-colors hover:border-primary">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={512}
                    height={256}
                    className="h-64 w-full rounded object-cover"
                  />

                  <CardHeader>
                    <CardTitle>
                      <Link href={`/admin/clothing-items/${item.id}`}>
                        {item.name} (
                        {item.category === "none"
                          ? "no category"
                          : item.category}
                        )
                      </Link>
                    </CardTitle>

                    <CardDescription className="flex min-w-0 items-center">
                      <span className="max-w-2/3 truncate">
                        {item.brandName || "No brand"}
                      </span>{" "}
                      <Dot className="-mx-1 inline" />{" "}
                      {item.genderTarget === "none" && (
                        <Badge variant="destructive">No gender specified</Badge>
                      )}
                      {item.genderTarget !== "none" && (
                        <Badge variant="outline" className="capitalize">
                          {item.genderTarget}
                        </Badge>
                      )}
                    </CardDescription>

                    <CardAction>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <EllipsisVertical />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent>
                          <DropdownMenuItem
                            asChild
                            className="flex items-center gap-2"
                          >
                            <Link href={`/admin/clothing-items/${item.id}`}>
                              <Edit2 />
                              <span>Edit Item</span>
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            asChild
                            className="flex items-center gap-2"
                          >
                            <Link
                              href={`/admin/clothing-items/${item.id}/inventory`}
                            >
                              <Layers />
                              <span>Edit Inventory</span>
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            variant="destructive"
                            className="flex items-center gap-2"
                            onClick={() => setDeletingItem(item)}
                          >
                            <Trash2 />
                            <span>Delete Item</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardAction>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-4 capitalize">
                    <div className="flex max-w-full flex-wrap gap-2">
                      {!item.lastEmbeddingGeneratedAt && (
                        <Badge variant="destructive">
                          Embedding Not Generated
                        </Badge>
                      )}

                      {item.fitType !== "none" && <Badge>{item.fitType}</Badge>}

                      {item.fitType === "none" && (
                        <Badge variant="destructive">No Fit Type</Badge>
                      )}

                      {item.primaryStyle !== "none" && (
                        <Badge variant="default">{item.primaryStyle}</Badge>
                      )}

                      {item.primaryStyle === "none" && (
                        <Badge variant="destructive">No Primary Style</Badge>
                      )}

                      {item.secondaryStyles
                        .filter((x) => x !== "none")
                        .map((style) => (
                          <Badge variant="secondary" key={style}>
                            {style}
                          </Badge>
                        ))}

                      {item.season !== "all" && <Badge>{item.season}</Badge>}

                      {item.material !== "none" && (
                        <Badge variant="outline">{item.material}</Badge>
                      )}

                      {item.colors
                        .filter((x) => x !== "none")
                        .map((color) => (
                          <Badge key={color} variant="outline">
                            {color}
                          </Badge>
                        ))}

                      {item.colors.filter((x) => x !== "none").length === 0 && (
                        <Badge variant="destructive">No Colors</Badge>
                      )}
                    </div>

                    <p className="max-w-full text-sm text-wrap wrap-anywhere">
                      {item.description.slice(0, 200) || "No description"}
                    </p>
                  </CardContent>

                  <Separator />

                  <CardFooter className="justify-between">
                    <Tooltip delayDuration={250}>
                      <TooltipTrigger>
                        <p className="text-sm">
                          {item.isActive ? "Active" : "Inactive"}
                        </p>
                      </TooltipTrigger>

                      <TooltipContent>
                        {item.isActive
                          ? "This item is visible to customers."
                          : "This item is hidden from customers."}
                      </TooltipContent>
                    </Tooltip>

                    <p className="text-sm">{item.stock} in stock</p>
                  </CardFooter>
                </Card>
              </ContextMenuTrigger>

              <ContextMenuContent>
                <ContextMenuItem asChild className="flex items-center gap-2">
                  <Link href={`/admin/clothing-items/${item.id}`}>
                    <Edit2 />
                    <span>Edit Item</span>
                  </Link>
                </ContextMenuItem>

                <ContextMenuItem asChild className="flex items-center gap-2">
                  <Link href={`/admin/clothing-items/${item.id}/inventory`}>
                    <Layers />
                    <span>Edit Inventory</span>
                  </Link>
                </ContextMenuItem>

                <ContextMenuSeparator />

                <ContextMenuItem
                  variant="destructive"
                  className="flex items-center gap-2"
                  onClick={() => setDeletingItem(item)}
                >
                  <Trash2 />
                  <span>Delete Item</span>
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
      </PageContent>

      <AlertDialog
        open={!!deletingItem}
        onOpenChange={() => setDeletingItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingItem?.name}" and all of
              its inventory entries? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageCard>
  );
}
