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
import { Button } from "@repo/ui/common/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
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
  DropdownMenuSeparator,
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
import { EllipsisVertical, Shirt, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../lib/api.client";

const boxStatuses: Schema<"DeliveryBoxStatus">[] = [
  "preparing",
  "shipping",
  "returning",
  "completed",
];

export default function AdminBoxesPage() {
  const queryClient = useQueryClient();
  const boxes = useQuery(api, "/delivery-boxes/admin/all", {
    queryKey: ["admin-delivery-boxes"],
  });

  const [deletingBox, setDeletingBox] =
    useState<Schema<"AdminBoxResponseDto"> | null>(null);

  const [changingStatusToCleaning, setChangingStatusToCleaning] =
    useState<Schema<"AdminBoxResponseDto"> | null>(null);

  async function handleBulkChangeStatusToInCleaning() {
    const box = changingStatusToCleaning;
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

  async function handleChangeStatus(
    box: Schema<"AdminBoxResponseDto">,
    newStatus: Schema<"DeliveryBoxStatus">,
  ) {
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
      ["admin-delivery-boxes"],
      (oldData: Schema<"AdminBoxResponseDto">[]) =>
        oldData.map((b: Schema<"AdminBoxResponseDto">) =>
          b.id === box.id ? { ...b, status: newStatus } : b,
        ),
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
      if (newStatus === "completed") setChangingStatusToCleaning(box);
      return;
    }

    // Revert optimistic update
    queryClient.setQueryData(
      ["admin-delivery-boxes"],
      (oldData: Schema<"AdminBoxResponseDto">[]) =>
        oldData.map((b: Schema<"AdminBoxResponseDto">) =>
          b.id === box.id ? { ...b, status: oldStatus } : b,
        ),
    );
  }

  async function handleDeleteBox() {
    if (!deletingBox) return;

    const { isOk } = await api.sendRequest(
      "/delivery-boxes/admin/{boxId}",
      {
        method: "delete",
        parameters: {
          boxId: deletingBox.id,
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

    setDeletingBox(null);
    queryClient.setQueryData(
      ["admin-delivery-boxes"],
      (oldData: Schema<"AdminBoxResponseDto">[]) =>
        oldData.filter(
          (box: Schema<"AdminBoxResponseDto">) => box.id !== deletingBox.id,
        ),
    );
  }

  if (boxes.isLoading) return <LoadingScreen />;

  return (
    <PageCard>
      <PageHeader>
        <PageTitle>Boxes</PageTitle>
        <PageDescription>Manage all of users' boxes here</PageDescription>
      </PageHeader>

      <PageContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-3/14">Username</TableHead>
              <TableHead className="w-1/7">Month</TableHead>
              <TableHead className="w-1/7">Status</TableHead>
              <TableHead className="w-1/7">Items</TableHead>
              <TableHead className="w-1/7">Sent At</TableHead>
              <TableHead className="w-1/7">Returned At</TableHead>
              <TableHead className="w-1/14">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {boxes.data?.map((box) => (
              <ContextMenu key={box.id}>
                <ContextMenuTrigger asChild>
                  <TableRow key={box.id}>
                    <TableCell className="font-medium">
                      {box.username}
                    </TableCell>
                    <TableCell>{format(box.month, "MMMM yyyy")}</TableCell>
                    <TableCell className="pr-8">
                      <Select
                        value={box.status === "none" ? "" : box.status}
                        disabled={box.status === "none"}
                        onValueChange={(x) =>
                          handleChangeStatus(
                            box,
                            x as Schema<"DeliveryBoxStatus">,
                          )
                        }
                      >
                        <SelectTrigger className="w-full capitalize opacity-100!">
                          <SelectValue placeholder="Unfinished" />
                        </SelectTrigger>

                        <SelectContent>
                          {boxStatuses.map((status) => (
                            <SelectItem
                              key={status}
                              value={status}
                              className="capitalize"
                            >
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{box.itemCount}</TableCell>
                    <TableCell>
                      {box.sentAt ? format(box.sentAt, "dd.MM.yyyy") : "N/A"}
                    </TableCell>
                    <TableCell>
                      {box.returnedAt
                        ? format(box.returnedAt, "dd.MM.yyyy")
                        : "N/A"}
                    </TableCell>
                    <TableCell>
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
                            <Link href={`/admin/boxes/${box.id}`}>
                              <Shirt />
                              <span>View Items</span>
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            variant="destructive"
                            className="flex items-center gap-2"
                            onClick={() => setDeletingBox(box)}
                          >
                            <Trash2 />
                            <span>Delete Box</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                </ContextMenuTrigger>

                <ContextMenuContent>
                  <ContextMenuItem asChild className="flex items-center gap-2">
                    <Link href={`/admin/boxes/${box.id}`}>
                      <Shirt />
                      <span>View Items</span>
                    </Link>
                  </ContextMenuItem>

                  <ContextMenuSeparator />

                  <ContextMenuItem
                    variant="destructive"
                    className="flex items-center gap-2"
                    onClick={() => setDeletingBox(box)}
                  >
                    <Trash2 />
                    <span>Delete Box</span>
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </TableBody>
        </Table>
      </PageContent>

      <AlertDialog
        open={!!deletingBox}
        onOpenChange={() => setDeletingBox(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this box?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Deleting a box will make the user to whom the box belongs unable
              to access its contents. If the box was unfinished, the user will
              have to create a new one from scratch. This action cannot be
              undone.
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

      <Dialog
        open={!!changingStatusToCleaning}
        onOpenChange={() => setChangingStatusToCleaning(null)}
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
