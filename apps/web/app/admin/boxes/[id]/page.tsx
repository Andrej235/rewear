"use client";

import { Schema } from "@repo/lib/api/types/schema/schema-parser";
import { useQuery } from "@repo/lib/api/use-query";
import { cn } from "@repo/lib/cn";
import { toTitleCase } from "@repo/lib/utils/title-case";
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
import { Button } from "@repo/ui/common/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@repo/ui/common/context-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/common/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/common/table";
import { LoadingScreen } from "@repo/ui/loading-screen";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { EllipsisVertical, QrCode, Trash2 } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import QRCodeDialog from "../../../../components/qr-code-dialog";
import { api } from "../../../../lib/api.client";
import { baseUrl } from "../../../../lib/base-url";

const boxStatuses: Schema<"DeliveryBoxStatus">[] = [
  "preparing",
  "shipping",
  "returning",
  "completed",
];

const statuses: Schema<"InventoryItemStatus">[] = [
  "available",
  "reserved",
  "inCleaning",
  "retired",
];

const conditions: Schema<"InventoryItemCondition">[] = [
  "new",
  "likeNew",
  "veryGood",
  "good",
  "acceptable",
  "poor",
  "damaged",
];

export default function AdminBoxPage() {
  const { id } = useParams();
  const params = useSearchParams();
  const highlight = params.get("highlight");

  const queryClient = useQueryClient();
  const boxQuery = useQuery(api, "/delivery-boxes/admin/{id}", {
    parameters: { id: id as string },
    queryKey: ["admin-delivery-boxes", id],
    enabled: typeof id === "string" && id.length > 0,
  });
  const box = boxQuery.data;

  useEffect(() => {
    if (!highlight) return;

    const element = document.getElementById(highlight);
    element?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [highlight, box]);

  const [
    changeStatusToCleaningDialogOpen,
    setChangeStatusToCleaningDialogOpen,
  ] = useState(false);

  // keep these as separate states to avoid re-rendering the QR code dialog (which causes flickering) when just opening/closing it
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  function handleViewQRCode(inventoryItemId: string) {
    if (!box) return;

    const url = `${baseUrl}/admin/boxes/${box.id}?highlight=${inventoryItemId}`;
    setQrCodeUrl(url);
    setQrCodeDialogOpen(true);
  }

  async function handleChangeStatus(newStatus: Schema<"DeliveryBoxStatus">) {
    if (!box) return;

    const oldStatus = box.status;
    if (oldStatus === "none") {
      toast.error("Cannot change status of an unfinished box.");
      return;
    }

    if (newStatus === "none") {
      toast.error("Cannot change status to unfinished.");
      return;
    }

    if (oldStatus === newStatus) return;

    // Optimistic update
    queryClient.setQueryData(
      ["admin-delivery-boxes", box.id],
      (oldData: Schema<"AdminBoxResponseDto"> | undefined) => {
        if (!oldData) return oldData;
        return { ...oldData, status: newStatus };
      },
    );

    const { isOk } = await api.sendRequest(
      "/delivery-boxes/admin/{boxId}/status",
      {
        method: "patch",
        parameters: {
          boxId: box.id,
          status: newStatus,
        },
      },
      {
        toasts: {
          success: "Box status updated successfully.",
          loading: "Updating box status...",
          error: (e) => e.message || "Failed to update box status.",
        },
      },
    );

    if (isOk) {
      if (newStatus === "completed") setChangeStatusToCleaningDialogOpen(true);
      return;
    }

    // Revert optimistic update
    queryClient.setQueryData(
      ["admin-delivery-boxes", box.id],
      (oldData: Schema<"AdminBoxResponseDto"> | undefined) => {
        if (!oldData) return oldData;
        return { ...oldData, status: oldStatus };
      },
    );
  }

  async function handleChangeCondition(
    item: Schema<"AdminDeliveryBoxItemResponseDto">,
    newCondition: Schema<"InventoryItemCondition">,
  ) {
    if (!box) return;

    const oldCondition = item.inventoryItem.condition;
    if (oldCondition === newCondition) return;

    // Optimistic update
    queryClient.setQueryData(
      ["admin-delivery-boxes", box.id],
      (oldData: Schema<"FullAdminBoxResponseDto"> | undefined) => {
        if (!oldData) return oldData;

        const updatedItems = oldData.items.map((boxItem) => {
          if (boxItem.clothingItemId === item.clothingItemId) {
            return {
              ...boxItem,
              inventoryItem: {
                ...boxItem.inventoryItem,
                condition: newCondition,
              },
            };
          }
          return boxItem;
        });

        return { ...oldData, items: updatedItems };
      },
    );

    const { isOk } = await api.sendRequest(
      "/inventory-items/change-condition",
      {
        method: "patch",
        payload: {
          inventoryItemId: item.inventoryItem.id,
          newCondition,
        },
      },
      {
        toasts: {
          success: "Item condition updated successfully.",
          loading: "Updating item condition...",
          error: (e) => e.message || "Failed to update item condition.",
        },
      },
    );

    if (isOk) return;

    // Revert optimistic update
    queryClient.setQueryData(
      ["admin-delivery-boxes", box.id],
      (oldData: Schema<"FullAdminBoxResponseDto"> | undefined) => {
        if (!oldData) return oldData;

        const updatedItems = oldData.items.map((boxItem) => {
          if (boxItem.clothingItemId === item.clothingItemId) {
            return {
              ...boxItem,
              inventoryItem: {
                ...boxItem.inventoryItem,
                condition: oldCondition,
              },
            };
          }
          return boxItem;
        });

        return { ...oldData, items: updatedItems };
      },
    );
  }

  async function handleChangeItemStatus(
    item: Schema<"AdminDeliveryBoxItemResponseDto">,
    newStatus: Schema<"InventoryItemStatus">,
  ) {
    if (!box) return;

    const oldStatus = item.inventoryItem.status;
    if (oldStatus === newStatus) return;

    // Optimistic update
    queryClient.setQueryData(
      ["admin-delivery-boxes", box.id],
      (oldData: Schema<"FullAdminBoxResponseDto"> | undefined) => {
        if (!oldData) return oldData;

        const updatedItems = oldData.items.map((boxItem) => {
          if (boxItem.clothingItemId === item.clothingItemId) {
            return {
              ...boxItem,
              inventoryItem: {
                ...boxItem.inventoryItem,
                status: newStatus,
              },
            };
          }
          return boxItem;
        });

        return { ...oldData, items: updatedItems };
      },
    );

    const { isOk } = await api.sendRequest(
      "/inventory-items/change-status",
      {
        method: "patch",
        payload: {
          inventoryItemId: item.inventoryItem.id,
          newStatus,
        },
      },
      {
        toasts: {
          success: "Item status updated successfully.",
          loading: "Updating item status...",
          error: (e) => e.message || "Failed to update item status.",
        },
      },
    );

    if (isOk) return;

    // Revert optimistic update
    queryClient.setQueryData(
      ["admin-delivery-boxes", box.id],
      (oldData: Schema<"FullAdminBoxResponseDto"> | undefined) => {
        if (!oldData) return oldData;

        const updatedItems = oldData.items.map((boxItem) => {
          if (boxItem.clothingItemId === item.clothingItemId) {
            return {
              ...boxItem,
              inventoryItem: {
                ...boxItem.inventoryItem,
                status: oldStatus,
              },
            };
          }
          return boxItem;
        });

        return { ...oldData, items: updatedItems };
      },
    );
  }

  async function handleBulkChangeStatusToInCleaning() {
    if (!box) return;

    const { isOk } = await api.sendRequest(
      "/delivery-boxes/admin/{boxId}/items/status",
      {
        method: "patch",
        parameters: {
          boxId: box.id,
          status: "inCleaning",
        },
      },
      {
        toasts: {
          success: "All items' status updated to In Cleaning successfully.",
          loading: "Updating items' status to In Cleaning...",
          error: (e) => e.message || "Failed to update items' status.",
        },
      },
    );

    if (!isOk) return;
    console.log("update");

    queryClient.setQueryData(
      ["admin-delivery-boxes", box.id],
      (oldData: Schema<"FullAdminBoxResponseDto"> | undefined) => {
        if (!oldData) return oldData;

        const updatedItems = oldData.items.map((item) => ({
          ...item,
          inventoryItem: {
            ...item.inventoryItem,
            status: "inCleaning" as Schema<"InventoryItemStatus">,
          },
        }));

        return { ...oldData, items: updatedItems };
      },
    );
  }

  const router = useRouter();
  async function handleDeleteBox() {
    if (!box) return;

    const { isOk } = await api.sendRequest(
      "/delivery-boxes/admin/{boxId}",
      {
        method: "delete",
        parameters: {
          boxId: box.id,
        },
      },
      {
        toasts: {
          success: "Box deleted successfully.",
          loading: "Deleting box...",
          error: (e) => e.message || "Failed to delete box.",
        },
      },
    );

    if (!isOk) return;
    router.push("/admin/boxes");
  }

  if (boxQuery.isLoading || !box) return <LoadingScreen />;

  return (
    <PageCard>
      <PageHeader>
        <PageTitle className="flex items-center gap-4">
          <span>
            {box.username}'s box for {format(box.month, "MMMM yyyy")}
          </span>

          <Select
            disabled={box.status === "none"}
            value={box.status === "none" ? "" : box.status}
            onValueChange={handleChangeStatus}
          >
            <SelectTrigger className="capitalize">
              <SelectValue placeholder="Unfinished" />
            </SelectTrigger>

            <SelectContent>
              {boxStatuses.map((status) => (
                <SelectItem className="capitalize" key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </PageTitle>

        <PageDescription>Manage this box's data</PageDescription>

        <PageAction>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <span>Delete Box</span>
                <Trash2 className="ml-2" />
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to delete this box?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Deleting a box will make the user to whom the box belongs
                  unable to access its contents. If the box was unfinished, the
                  user will have to create a new one from scratch. This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button variant="destructive" onClick={handleDeleteBox}>
                    Delete Box
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </PageAction>
      </PageHeader>

      <PageContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4">Name</TableHead>
              <TableHead className="w-1/4">Size</TableHead>
              <TableHead className="w-1/8">Condition</TableHead>
              <TableHead className="w-1/8">Status</TableHead>
              <TableHead className="w-1/8">Times Rented</TableHead>
              <TableHead className="w-1/8 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {box?.items.map((item) => (
              <ContextMenu key={item.clothingItemId}>
                <ContextMenuTrigger asChild>
                  <TableRow
                    className={cn(
                      highlight === item.clothingItemId && "bg-primary/50",
                    )}
                    id={item.clothingItemId}
                  >
                    <TableCell className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewQRCode(item.clothingItemId)}
                      >
                        <QrCode />
                      </Button>
                      <span>{item.clothingItemName}</span>
                    </TableCell>

                    <TableCell>{getSizeText(item.inventoryItem)}</TableCell>

                    <TableCell>
                      <Select
                        value={item.inventoryItem.condition}
                        onValueChange={(x) =>
                          handleChangeCondition(
                            item,
                            x as Schema<"InventoryItemCondition">,
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          {conditions.map((condition) => (
                            <SelectItem key={condition} value={condition}>
                              {toTitleCase(condition.replace(/_/g, " "))}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell>
                      <Select
                        value={item.inventoryItem.status}
                        onValueChange={(x) =>
                          handleChangeItemStatus(
                            item,
                            x as Schema<"InventoryItemStatus">,
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          {statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {toTitleCase(status.replace(/_/g, " "))}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell>{item.inventoryItem.timesRented}</TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <EllipsisVertical />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent>
                          <DropdownMenuItem
                            className="flex items-center gap-2"
                            onClick={() =>
                              handleViewQRCode(item.clothingItemId)
                            }
                          >
                            <QrCode />
                            <span>View QR Code</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                </ContextMenuTrigger>

                <ContextMenuContent>
                  <ContextMenuItem
                    className="flex items-center gap-2"
                    onClick={() => handleViewQRCode(item.clothingItemId)}
                  >
                    <QrCode />
                    <span>View QR Code</span>
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </TableBody>
        </Table>
      </PageContent>

      <QRCodeDialog
        open={qrCodeDialogOpen}
        url={qrCodeUrl || ""}
        setOpen={setQrCodeDialogOpen}
      />

      <Dialog
        open={changeStatusToCleaningDialogOpen}
        onOpenChange={setChangeStatusToCleaningDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Do you want to change Status of all items to "In Cleaning"?
            </DialogTitle>

            <DialogDescription>
              You can always do this manually by changing individual items'
              status.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">No</Button>
            </DialogClose>
            <DialogClose onClick={handleBulkChangeStatusToInCleaning} asChild>
              <Button>Yes</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageCard>
  );
}

function getSizeText(item: Schema<"AdminInventoryItemResponseDto">): string {
  switch (item.category) {
    case "top":
    case "outerwear":
      return item.topSize || "Size not specified";

    case "bottom":
      return (
        [item.bottomWaistSize, item.bottomLengthSize]
          .filter(Boolean)
          .join(" x ") || "Size not specified"
      );

    case "footwear":
      return item.shoeSize || "Size not specified";

    case "none":
      return "Category not specified";
  }
}
