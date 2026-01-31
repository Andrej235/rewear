"use client";
import { Schema } from "@repo/lib/api/types/schema/schema-parser";
import { useQuery } from "@repo/lib/api/use-query";
import { cn } from "@repo/lib/cn";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/common/alert-dialog";
import { Badge } from "@repo/ui/common/badge";
import { Button } from "@repo/ui/common/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/common/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@repo/ui/common/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/common/select";
import { LoadingScreen } from "@repo/ui/loading-screen";
import { useQueryClient } from "@tanstack/react-query";
import { EllipsisVertical, Eye, Send, Sparkles, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MouseEvent } from "react";
import { toast } from "sonner";
import { api } from "../../../../../lib/api.client";
import { pagePaddingX } from "../../../../../lib/page-padding";

export default function LatestBoxPage() {
  const queryClient = useQueryClient();
  const latestBoxQuery = useQuery(api, "/delivery-boxes/latest", {
    queryKey: ["latest-box"],
  });

  function getSizeString(invItem: Schema<"InventoryItemResponseDto">) {
    switch (invItem.category) {
      case "top":
      case "outerwear":
        return invItem.topSize!;
      case "bottom":
        return invItem.bottomWaistSize + " x " + invItem.bottomLengthSize;
      case "footwear":
        return invItem.shoeSize!;
      default:
        return "N/A";
    }
  }

  async function handleRemove(inventoryItemId: string) {
    const { isOk } = await api.sendRequest(
      "/delivery-boxes/latest/remove-item/{inventoryItemId}",
      {
        method: "delete",
        parameters: {
          inventoryItemId,
        },
      },
      {
        toasts: {
          success: "Item removed from your latest box.",
          loading: "Removing item from your latest box...",
          error: (e) =>
            e.message || "Failed to remove item from your latest box.",
        },
      },
    );

    if (!isOk) return;

    queryClient.setQueryData(
      ["latest-box"],
      (oldData: Schema<"FullDeliveryBoxResponseDto"> | undefined) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          items: oldData.items.filter(
            (item) => item.inventoryItem.id !== inventoryItemId,
          ),
        };
      },
    );
  }

  async function handleFillWithAI() {
    const { isOk } = await api.sendRequest(
      "/delivery-boxes/latest/fill-with-ai",
      {
        method: "post",
      },
      {
        toasts: {
          success: "Your latest box has been filled with AI-selected items.",
          loading: "Filling your latest box with AI-selected items...",
          error: (e) =>
            e.message ||
            "Failed to fill your latest box with AI-selected items.",
        },
      },
    );

    if (!isOk) return;

    latestBoxQuery.refetch();
  }

  async function handleChangeSize(
    item: Schema<"ClothingItemPreviewResponseDto">,
    invItem: Schema<"InventoryItemResponseDto">,
    newSize: string,
  ) {
    const { isOk, data } = await api.sendRequest(
      "/delivery-boxes/latest/change-item-size",
      {
        method: "patch",
        payload: {
          inventoryItemId: invItem.id,
          newSize,
        },
      },
      {
        toasts: {
          success: "Item size updated successfully.",
          loading: "Updating item size...",
          error: (e) => e.message || "Failed to update item size.",
        },
      },
    );

    if (!isOk) return;

    queryClient.setQueryData(
      ["latest-box"],
      (oldData: Schema<"FullDeliveryBoxResponseDto"> | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          items: oldData.items.map((boxItem) => {
            if (boxItem.clothingItem.id !== item.id) return boxItem;

            return {
              ...boxItem,
              inventoryItem: {
                id: data!,
                category: invItem.category,
                // Update size fields based on category
                topSize:
                  invItem.category === "top" || invItem.category === "outerwear"
                    ? newSize
                    : boxItem.inventoryItem.topSize,
                bottomWaistSize:
                  invItem.category === "bottom"
                    ? newSize.split(" x ")[0]
                    : boxItem.inventoryItem.bottomWaistSize,
                bottomLengthSize:
                  invItem.category === "bottom"
                    ? newSize.split(" x ")[1]
                    : boxItem.inventoryItem.bottomLengthSize,
                shoeSize:
                  invItem.category === "footwear"
                    ? newSize
                    : boxItem.inventoryItem.shoeSize,
              },
            };
          }),
        };
      },
    );
  }

  const router = useRouter();
  async function handleSendBox() {
    const { isOk } = await api.sendRequest(
      "/delivery-boxes/send",
      {
        method: "post",
      },
      {
        toasts: {
          success: "Your latest box has been sent out!",
          loading: "Sending out your latest box...",
          error: (e) => e.message || "Failed to send out your latest box.",
        },
      },
    );

    if (!isOk) return;
    router.push("/boxes");
  }

  function validateBox(e: MouseEvent<HTMLButtonElement>) {
    if (!latestBoxQuery.data) {
      e.preventDefault();
      return;
    }

    if (latestBoxQuery.data.items.length === 0) {
      toast.error("Your box is empty. Please add items before sending.");

      e.preventDefault();
      return;
    }

    if (
      latestBoxQuery.data.items.length > (latestBoxQuery.data.maxItemCount || 0)
    ) {
      toast.error(
        `You have exceeded the maximum item count of ${latestBoxQuery.data.maxItemCount} defined in your subscription plan. Please remove some items before sending.`,
      );

      e.preventDefault();
      return;
    }
  }

  if (latestBoxQuery.isLoading) return <LoadingScreen />;

  const latestBox = latestBoxQuery.data;

  return (
    <PageCard className={pagePaddingX}>
      <PageHeader className="px-0!">
        <PageTitle>Your Latest Box</PageTitle>
        <PageDescription>
          Manage clothes you wish to receive in your next box. Currently holding{" "}
          <span
            className={cn(
              (latestBox?.items.length || 0) > (latestBox?.maxItemCount || 0) &&
                "text-destructive",
            )}
          >
            {latestBox?.items.length || 0} / {latestBox?.maxItemCount || 0}
          </span>{" "}
          items.
        </PageDescription>

        <PageAction className="space-x-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button onClick={validateBox}>
                <span>Send</span>
                <Send className="ml-2" />
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to send out your latest box?
                </AlertDialogTitle>

                <AlertDialogDescription>
                  Once sent, you will not be able to make further changes to it
                  and the only way to cancel is to contact support.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>

                <AlertDialogAction onClick={handleSendBox}>
                  Send
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button onClick={handleFillWithAI}>
            <span>Fill With AI</span>
            <Sparkles className="ml-2" />
          </Button>
        </PageAction>
      </PageHeader>

      <PageContent className="px-0!">
        {!latestBox ||
          (latestBox.items.length === 0 && (
            <div className="py-20 text-center text-muted-foreground">
              No items in your latest box yet.
            </div>
          ))}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
          {latestBox?.items.map(
            ({
              clothingItem: item,
              chosenByAi,
              inventoryItem: invItem,
              availableSizes,
            }) => {
              const sizeStr = getSizeString(invItem);

              return (
                <ContextMenu key={item.id}>
                  <ContextMenuTrigger asChild>
                    <Link href={`/clothes/${item.id}`} className="max-w-full">
                      <Card className="min-h-full gap-4 border-2 border-primary/40 pt-0 transition-colors hover:border-primary">
                        <div className="relative aspect-2/1 w-full lg:h-64">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="h-64 w-full min-w-0 rounded object-cover"
                          />
                        </div>

                        <CardHeader>
                          <CardTitle>
                            <span>{item.name}</span>
                            {chosenByAi && <Badge className="ml-2">AI</Badge>}
                          </CardTitle>

                          <CardDescription className="flex min-w-0 items-center">
                            {item.description.length > 200
                              ? item.description.slice(0, 200) + "..."
                              : item.description || "No description"}
                          </CardDescription>
                        </CardHeader>

                        <CardFooter className="flex-row-reverse justify-between">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost">
                                <EllipsisVertical />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent>
                              <DropdownMenuItem
                                asChild
                                className="flex items-center gap-2"
                              >
                                <Link href={`/clothes/${item.id}`}>
                                  <Eye />
                                  <span>View Details</span>
                                </Link>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                variant="destructive"
                                className="flex items-center gap-2"
                                onClick={(e) => {
                                  handleRemove(invItem.id);
                                  e.stopPropagation();
                                }}
                              >
                                <Trash2 />
                                <span>Remove</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <Select
                            value={sizeStr}
                            onValueChange={(newSize) =>
                              handleChangeSize(item, invItem, newSize)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>

                            <SelectContent>
                              {availableSizes.map((size) => (
                                <SelectItem
                                  key={size}
                                  value={size}
                                  onSelect={(e) => {
                                    e.preventDefault();
                                  }}
                                >
                                  {size}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </CardFooter>
                      </Card>
                    </Link>
                  </ContextMenuTrigger>

                  <ContextMenuContent>
                    <ContextMenuItem
                      asChild
                      className="flex items-center gap-2"
                    >
                      <Link href={`/clothes/${item.id}`}>
                        <Eye />
                        <span>View Details</span>
                      </Link>
                    </ContextMenuItem>

                    <ContextMenuItem
                      variant="destructive"
                      className="flex items-center gap-2"
                      onClick={() => handleRemove(invItem.id)}
                    >
                      <Trash2 />
                      <span>Remove</span>
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              );
            },
          )}
        </div>
      </PageContent>
    </PageCard>
  );
}
