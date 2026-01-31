"use client";

import { Schema } from "@repo/lib/api/types/schema/schema-parser";
import { useQuery } from "@repo/lib/api/use-query";
import { cn } from "@repo/lib/cn";
import { useLeaveConfirmation } from "@repo/lib/hooks/use-leave-confirmation";
import { toTitleCase } from "@repo/lib/utils/title-case";
import { Button } from "@repo/ui/common/button";
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
import { EllipsisVertical, QrCode, SaveAll } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import QRCodeDialog from "../../../../components/qr-code-dialog";
import { api } from "../../../../lib/api.client";
import { baseUrl } from "../../../../lib/base-url";

type ChangeTracker = {
  id: string;

  status: Schema<"InventoryItemStatus">;
  originalStatus: Schema<"InventoryItemStatus">;

  condition: Schema<"InventoryItemCondition">;
  originalCondition: Schema<"InventoryItemCondition">;

  changed: boolean;
};

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

  const changedValues = useRef<ChangeTracker[]>([]);
  useLeaveConfirmation(() =>
    changedValues.current.some((item) => item.changed),
  );

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

  useEffect(initializeChangedValues, [box]);

  function initializeChangedValues() {
    if (!box) return;

    changedValues.current = box.items.map((item) => ({
      id: item.inventoryItem.id,

      size: getSizeText(item.inventoryItem),
      originalSize: getSizeText(item.inventoryItem),

      condition: item.inventoryItem.condition,
      originalCondition: item.inventoryItem.condition,

      status: item.inventoryItem.status,
      originalStatus: item.inventoryItem.status,

      changed: false,
    }));
  }

  async function handleSaveChanges() {
    const itemsToUpdate = changedValues.current.filter((item) => item.changed);
    if (itemsToUpdate.length === 0) {
      toast.info("No changes to save");
      return;
    }

    const promise = (async () => {
      let successCount = 0;

      for (const item of itemsToUpdate) {
        if (item.condition !== item.originalCondition) {
          const { isOk } = await api.sendRequest(
            "/inventory-items/change-condition",
            {
              method: "patch",
              payload: {
                inventoryItemId: item.id,
                newCondition: item.condition,
              },
            },
          );
          if (isOk) successCount++;
        }

        if (item.status !== item.originalStatus) {
          const { isOk } = await api.sendRequest(
            "/inventory-items/change-status",
            {
              method: "patch",
              payload: {
                inventoryItemId: item.id,
                newStatus: item.status,
              },
            },
          );
          if (isOk) successCount++;
        }
      }

      return successCount;
    })();

    toast.promise(promise, {
      loading: `Saving ${itemsToUpdate.length} changes...`,
      success: (successCount) =>
        `Successfully saved ${successCount} out of ${itemsToUpdate.length} changes`,
      error: (e) => e.message || `Failed to save changes`,
    });

    initializeChangedValues();
    boxQuery.refetch();
  }

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

    if (isOk) return;

    // Revert optimistic update
    queryClient.setQueryData(
      ["admin-delivery-boxes", box.id],
      (oldData: Schema<"AdminBoxResponseDto"> | undefined) => {
        if (!oldData) return oldData;
        return { ...oldData, status: oldStatus };
      },
    );
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
            {box?.items.map((item, i) => (
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
                        defaultValue={item.inventoryItem.condition}
                        onValueChange={(
                          newValue: Schema<"InventoryItemCondition">,
                        ) => {
                          const prev = changedValues.current[i]!;
                          prev.condition = newValue;
                          prev.changed = prev.originalCondition !== newValue;
                        }}
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
                        defaultValue={item.inventoryItem.status}
                        onValueChange={(
                          newValue: Schema<"InventoryItemStatus">,
                        ) => {
                          const prev = changedValues.current[i]!;
                          prev.status = newValue;
                          prev.changed = prev.originalStatus !== newValue;
                        }}
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

      <div className="fixed right-8 bottom-8 size-max rounded-full">
        <Button
          size="icon-lg"
          className="size-16 rounded-full"
          onClick={handleSaveChanges}
        >
          <SaveAll className="size-6" />
        </Button>
      </div>
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
