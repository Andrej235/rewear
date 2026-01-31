"use client";
import { Schema } from "@repo/lib/api/types/schema/schema-parser";
import { useQuery } from "@repo/lib/api/use-query";
import { cn } from "@repo/lib/cn";
import { useLeaveConfirmation } from "@repo/lib/hooks/use-leave-confirmation";
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
  DialogTrigger,
} from "@repo/ui/common/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/common/dropdown-menu";
import { Field, FieldGroup, FieldLabel } from "@repo/ui/common/field";
import { Input } from "@repo/ui/common/input";
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
import {
  EllipsisVertical,
  Plus,
  QrCode,
  SaveAll,
  ScanQrCode,
  Trash2,
} from "lucide-react";
import { notFound, useParams, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { InvQrCodeScannerDialog } from "../../../../../components/inv-qr-code-scanner-dialog";
import QRCodeDialog from "../../../../../components/qr-code-dialog";
import { api } from "../../../../../lib/api.client";
import { baseUrl } from "../../../../../lib/base-url";

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

type ChangeTracker = {
  id: string;

  size: string;
  originalSize: string;

  status: Schema<"InventoryItemStatus">;
  originalStatus: Schema<"InventoryItemStatus">;

  condition: Schema<"InventoryItemCondition">;
  originalCondition: Schema<"InventoryItemCondition">;

  changed: boolean;
};

export default function ClothingItemInventoryPage() {
  const params = useSearchParams();
  const highlight = params.get("highlight");
  const changedValues = useRef<ChangeTracker[]>([]);
  useLeaveConfirmation(() =>
    changedValues.current.some((item) => item.changed),
  );

  const { id } = useParams();
  const stock = useQuery(api, "/inventory-items/{clothingItemId}", {
    queryKey: ["admin-clothing-item-stock", id],
    parameters: {
      clothingItemId: id as string,
    },
    enabled: !!id && typeof id === "string",
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!highlight) return;

    const element = document.getElementById(highlight);
    element?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [highlight, stock.data]);

  useEffect(initializeChangedValues, [stock.data]);

  function initializeChangedValues() {
    if (!stock.data) return;

    changedValues.current = stock.data.inventoryItems.map((item) => ({
      id: item.id,

      size: getSizeText(item),
      originalSize: getSizeText(item),

      condition: item.condition,
      originalCondition: item.condition,

      status: item.status,
      originalStatus: item.status,

      changed: false,
    }));
  }

  const [deletingItem, setDeletingItem] =
    useState<Schema<"AdminInventoryItemResponseDto"> | null>(null);
  const [addingStock, setAddingStock] = useState<{
    size1: string;
    size2: string;
    count: number;
  }>({
    size1: "",
    size2: "",
    count: 1,
  });

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

  async function handleAddStock(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    initializeChangedValues(); // reset changed values to avoid issues with re-adding stock after edits

    if (addingStock.count < 1) {
      toast.error("Count must be at least 1");
      return;
    }

    if (addingStock.count >= 50) {
      toast.error("Count must be less than 50");
      return;
    }

    const { isOk } = await api.sendRequest(
      "/inventory-items",
      {
        method: "post",
        payload: {
          clothingItemId: stock.data!.clothingItemId,
          quantity: addingStock.count,
          category: stock.data!.category,
          topSize:
            stock.data!.category === "top" ||
            stock.data!.category === "outerwear"
              ? addingStock.size1
              : null,
          bottomWaistSize:
            stock.data!.category === "bottom" ? addingStock.size1 : null,
          bottomLengthSize:
            stock.data!.category === "bottom" ? addingStock.size2 : null,
          shoeSize:
            stock.data!.category === "footwear" ? addingStock.size1 : null,
        },
      },
      {
        toasts: {
          success: "Stock added successfully",
          loading: "Adding stock...",
          error: (e) => e.message || "Failed to add stock",
        },
      },
    );

    if (!isOk) return;

    // Reset form
    setAddingStock({
      size1: "",
      size2: "",
      count: 1,
    });

    // Refetch stock data
    stock.refetch();
  }

  async function handleDelete() {
    if (!deletingItem) return;

    const { isOk } = await api.sendRequest(
      "/inventory-items/{id}",
      {
        method: "delete",
        parameters: {
          id: deletingItem.id,
        },
      },
      {
        toasts: {
          success: "Inventory item deleted successfully",
          loading: "Deleting inventory item...",
          error: (e) => e.message || "Failed to delete inventory item",
        },
      },
    );

    if (!isOk) return;

    setDeletingItem(null);
    queryClient.setQueryData(
      ["admin-clothing-item-stock", stock.data!.clothingItemId],
      (oldData: Schema<"AdminStockResponseDto">) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          inventoryItems: oldData.inventoryItems.filter(
            (item) => item.id !== deletingItem.id,
          ),
        };
      },
    );
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

        if (item.size !== item.originalSize) {
          const { isOk } = await api.sendRequest(
            "/inventory-items/change-size",
            {
              method: "patch",
              payload: {
                inventoryItemId: item.id,
                topSize:
                  stock.data!.category === "top" ||
                  stock.data!.category === "outerwear"
                    ? item.size
                    : null,
                bottomWaistSize:
                  stock.data!.category === "bottom"
                    ? item.size.split(" x ")[0] || null
                    : null,
                bottomLengthSize:
                  stock.data!.category === "bottom"
                    ? item.size.split(" x ")[1] || null
                    : null,
                shoeSize:
                  stock.data!.category === "footwear" ? item.size : null,
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
  }

  // keep these as separate states to avoid re-rendering the QR code dialog (which causes flickering) when just opening/closing it
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  function handleViewQRCode(inventoryItemId: string) {
    const url = `${baseUrl}/admin/clothing-items/${stock.data!.clothingItemId}/inventory?highlight=${inventoryItemId}`;
    setQrCodeUrl(url);
    setQrCodeDialogOpen(true);
  }

  const [qrCodeScannerDialogOpen, setQrCodeScannerDialogOpen] = useState(false);
  function handleScanQRCode(inventoryItemId: string) {
    toast.info(`Scanned inventory item ID: ${inventoryItemId}`);
  }

  if (stock.isLoading) return <LoadingScreen />;
  if (!stock.data || stock.isError) return notFound();

  return (
    <PageCard>
      <PageHeader>
        <PageTitle>Inventory of "{stock.data.clothingItemName}"</PageTitle>
        <PageDescription>Modify available stock for this item.</PageDescription>

        <PageAction className="flex items-center gap-2">
          <Button
            variant="secondary"
            className="max-sm:size-9"
            onClick={() => setQrCodeScannerDialogOpen(true)}
          >
            <span className="sr-only sm:not-sr-only">QR Code</span>
            <ScanQrCode className="sm:ml-2" />
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <span>Add Stock</span>
                <Plus className="ml-2" />
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Stock</DialogTitle>
                <DialogDescription>
                  Enter size and count of the new stock items.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={handleAddStock}
                autoFocus={false}
                className="space-y-4"
              >
                <div>
                  {stock.data.category !== "none" && (
                    <>
                      <FieldGroup
                        className={cn(
                          stock.data.category === "bottom" &&
                            "grid grid-cols-2 gap-2",
                        )}
                      >
                        <Field>
                          <FieldLabel htmlFor="size-1">
                            {stock.data.category === "bottom"
                              ? "Waist Size"
                              : "Size"}
                          </FieldLabel>

                          <Input
                            id="size-1"
                            name="size-1"
                            required
                            placeholder="S, M, 32..."
                            value={addingStock.size1}
                            onChange={(e) =>
                              setAddingStock((prev) => ({
                                ...prev,
                                size1: e.target.value,
                              }))
                            }
                          />
                        </Field>

                        {stock.data.category === "bottom" && (
                          <Field>
                            <FieldLabel htmlFor="size-2">
                              Length Size
                            </FieldLabel>

                            <Input
                              id="size-2"
                              name="size-2"
                              required
                              placeholder="32"
                              value={addingStock.size2}
                              onChange={(e) =>
                                setAddingStock((prev) => ({
                                  ...prev,
                                  size2: e.target.value,
                                }))
                              }
                            />
                          </Field>
                        )}
                      </FieldGroup>

                      <Field className="mt-4" orientation="horizontal">
                        <FieldLabel htmlFor="count">Count:</FieldLabel>

                        <Input
                          id="count"
                          name="count"
                          type="number"
                          min={1}
                          max={50}
                          required
                          placeholder="1"
                          value={addingStock.count}
                          onChange={(e) =>
                            setAddingStock((prev) => ({
                              ...prev,
                              count: parseInt(e.target.value, 10),
                            }))
                          }
                        />
                      </Field>
                    </>
                  )}

                  {stock.data.category === "none" && (
                    <div className="text-sm text-muted-foreground">
                      Cannot add stock items because clothing item category is
                      not specified for this clothing item.
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary">Cancel</Button>
                  </DialogClose>

                  <DialogClose asChild>
                    <Button
                      type="submit"
                      disabled={
                        stock.data.category === "none" || addingStock.count < 1
                      }
                    >
                      Add Stock
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </PageAction>
      </PageHeader>

      <PageContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4">Id</TableHead>
              <TableHead className="w-1/4">Size</TableHead>
              <TableHead className="w-1/8">Condition</TableHead>
              <TableHead className="w-1/8">Status</TableHead>
              <TableHead className="w-1/8">Times Rented</TableHead>
              <TableHead className="w-1/8 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {stock.data.inventoryItems.map((item, i) => (
              <ContextMenu key={item.id}>
                <ContextMenuTrigger asChild>
                  <TableRow
                    className={cn(highlight === item.id && "bg-primary/50")}
                    id={item.id}
                  >
                    <TableCell className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewQRCode(item.id)}
                      >
                        <QrCode />
                      </Button>
                      <span>{item.id}</span>
                    </TableCell>

                    <TableCell>
                      <Input
                        defaultValue={getSizeText(item)}
                        onChange={(e) => {
                          const newValue = e.target.value.trim();
                          const prev = changedValues.current[i]!;
                          prev.size = newValue;
                          prev.changed = prev.originalSize !== newValue;
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Select
                        defaultValue={item.condition}
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
                        defaultValue={item.status}
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

                    <TableCell>{item.timesRented}</TableCell>

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
                            onClick={() => handleViewQRCode(item.id)}
                          >
                            <QrCode />
                            <span>View QR Code</span>
                          </DropdownMenuItem>

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
                    </TableCell>
                  </TableRow>
                </ContextMenuTrigger>

                <ContextMenuContent>
                  <ContextMenuItem
                    className="flex items-center gap-2"
                    onClick={() => handleViewQRCode(item.id)}
                  >
                    <QrCode />
                    <span>View QR Code</span>
                  </ContextMenuItem>

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
          </TableBody>
        </Table>
      </PageContent>

      <div className="fixed right-8 bottom-8 size-max rounded-full">
        <Button
          size="icon-lg"
          className="size-16 rounded-full"
          onClick={handleSaveChanges}
        >
          <SaveAll className="size-6" />
        </Button>
      </div>

      <QRCodeDialog
        open={qrCodeDialogOpen}
        url={qrCodeUrl || ""}
        setOpen={setQrCodeDialogOpen}
      />

      <InvQrCodeScannerDialog
        open={qrCodeScannerDialogOpen}
        clothingItemId={stock.data.clothingItemId}
        setOpen={setQrCodeScannerDialogOpen}
        onScan={handleScanQRCode}
      />

      <AlertDialog
        open={!!deletingItem}
        onOpenChange={() => setDeletingItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this inventory item?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>

            <div className="mt-4 flex items-center gap-2">
              <strong>Item ID:</strong> {deletingItem?.id}
            </div>
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
