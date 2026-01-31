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
import { Checkbox } from "@repo/ui/common/checkbox";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/common/table";
import { LoadingScreen } from "@repo/ui/loading-screen";
import { useQueryClient } from "@tanstack/react-query";
import { Edit2, EllipsisVertical, Plus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../lib/api.client";

export default function Page() {
  const queryClient = useQueryClient();
  const plans = useQuery(api, "/subscription-plans/all/admin", {
    queryKey: ["admin-subscription-plans"],
  });

  const [editingPlan, setEditingPlan] =
    useState<Schema<"AdminSubscriptionPlanResponseDto"> | null>(null);
  const [deletingPlan, setDeletingPlan] =
    useState<Schema<"AdminSubscriptionPlanResponseDto"> | null>(null);

  async function handleAddEmpty() {
    if (plans.data?.some((x) => x.name === "New Plan")) {
      toast.error(
        "Please edit or delete the existing 'New Plan' before creating another one.",
      );
      return;
    }

    const { isOk, data } = await api.sendRequest(
      "/subscription-plans",
      {
        method: "post",
        payload: {
          name: "New Plan",
          monthlyPrice: 99,
          allowsOuterwear: false,
          allowsShoes: false,
          maxItemsPerMonth: 0,
        },
      },
      {
        toasts: {
          success: "Subscription plan created successfully",
          loading: "Creating subscription plan...",
          error: (e: Error) =>
            e.message || "Failed to create subscription plan",
        },
      },
    );

    if (!isOk || !data) return;

    await queryClient.setQueryData(
      ["admin-subscription-plans"],
      (oldData: Schema<"AdminSubscriptionPlanResponseDto">[] | undefined) => {
        if (!oldData) return [data];

        return [...oldData, data];
      },
    );

    setEditingPlan(data);
  }

  async function handleEditPlan() {
    if (!editingPlan) return;

    const { isOk } = await api.sendRequest(
      "/subscription-plans",
      {
        method: "put",
        payload: editingPlan,
      },
      {
        toasts: {
          success: "Subscription plan updated successfully",
          loading: "Updating subscription plan...",
          error: (e: Error) =>
            e.message || "Failed to update subscription plan",
        },
      },
    );

    if (!isOk) return;

    await queryClient.setQueryData(
      ["admin-subscription-plans"],
      (oldData: Schema<"AdminSubscriptionPlanResponseDto">[] | undefined) => {
        if (!oldData) return oldData;

        return oldData.map((plan) =>
          plan.id === editingPlan.id ? editingPlan : plan,
        );
      },
    );

    setEditingPlan(null);
  }

  async function handleDeletePlan() {
    if (!deletingPlan) return;

    const { isOk } = await api.sendRequest(
      "/subscription-plans/{id}",
      {
        method: "delete",
        parameters: {
          id: deletingPlan.id,
        },
      },
      {
        toasts: {
          success: "Subscription plan deleted successfully",
          loading: "Deleting subscription plan...",
          error: (e: Error) =>
            e.message || "Failed to delete subscription plan",
        },
      },
    );

    if (!isOk) return;

    await queryClient.setQueryData(
      ["admin-subscription-plans"],
      (oldData: Schema<"AdminSubscriptionPlanResponseDto">[] | undefined) => {
        if (!oldData) return oldData;

        return oldData.filter((plan) => plan.id !== deletingPlan.id);
      },
    );

    setDeletingPlan(null);
  }

  if (plans.isLoading) return <LoadingScreen />;

  return (
    <PageCard>
      <PageHeader>
        <PageTitle>Subscription Plans</PageTitle>
        <PageDescription>Manage available subscription plans</PageDescription>

        <PageAction className="space-x-2">
          {editingPlan && (
            <Button variant="outline" onClick={() => setEditingPlan(null)}>
              <span>Discard Changes</span>
              <X className="ml-2" />
            </Button>
          )}
          <Button onClick={handleAddEmpty}>
            <span>New</span>
            <Plus className="ml-2" />
          </Button>
        </PageAction>
      </PageHeader>

      <PageContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-3/14">Name</TableHead>
              <TableHead className="w-1/7">Subscriptions</TableHead>
              <TableHead className="w-1/7">Monthly Price</TableHead>
              <TableHead className="w-1/7">Allows Outerwear</TableHead>
              <TableHead className="w-1/7">Allows Shoes</TableHead>
              <TableHead className="w-1/7">Max Items Per Month</TableHead>
              <TableHead className="w-1/14 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {plans.data?.map((plan) => (
              <ContextMenu key={plan.id}>
                <ContextMenuTrigger asChild>
                  <TableRow>
                    {editingPlan?.id !== plan.id && (
                      <>
                        <TableCell>{plan.name}</TableCell>
                        <TableCell>{plan.subscriptionsCount}</TableCell>
                        <TableCell>${plan.monthlyPrice.toFixed(2)}</TableCell>
                        <TableCell>
                          {plan.allowsOuterwear ? "Yes" : "No"}
                        </TableCell>
                        <TableCell>{plan.allowsShoes ? "Yes" : "No"}</TableCell>
                        <TableCell>{plan.maxItemsPerMonth}</TableCell>
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
                                onClick={() => setEditingPlan(plan)}
                              >
                                <Edit2 />
                                <span>Edit Plan</span>
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                variant="destructive"
                                className="flex items-center gap-2"
                                onClick={() => setDeletingPlan(plan)}
                              >
                                <Trash2 />
                                <span>Delete Plan</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </>
                    )}

                    {editingPlan?.id === plan.id && (
                      <>
                        <TableCell>
                          <Input
                            type="text"
                            value={editingPlan.name}
                            onChange={(e) =>
                              setEditingPlan({
                                ...editingPlan,
                                name: e.target.value,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {plan.subscriptionsCount}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={editingPlan.monthlyPrice}
                            onChange={(e) =>
                              setEditingPlan({
                                ...editingPlan,
                                monthlyPrice: Number(e.target.value),
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={editingPlan.allowsOuterwear}
                            onCheckedChange={(checked) =>
                              setEditingPlan({
                                ...editingPlan,
                                allowsOuterwear: !!checked,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={editingPlan.allowsShoes}
                            onCheckedChange={(checked) =>
                              setEditingPlan({
                                ...editingPlan,
                                allowsShoes: !!checked,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={editingPlan.maxItemsPerMonth}
                            onChange={(e) =>
                              setEditingPlan({
                                ...editingPlan,
                                maxItemsPerMonth: Number(e.target.value),
                              })
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" onClick={handleEditPlan}>
                            <Save />
                            <span>Save</span>
                          </Button>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                </ContextMenuTrigger>

                {!editingPlan && (
                  <ContextMenuContent>
                    <ContextMenuItem
                      className="flex items-center gap-2"
                      onClick={() => setEditingPlan(plan)}
                    >
                      <Edit2 />
                      <span>Edit Plan</span>
                    </ContextMenuItem>

                    <ContextMenuSeparator />

                    <ContextMenuItem
                      variant="destructive"
                      className="flex items-center gap-2"
                      onClick={() => setDeletingPlan(plan)}
                    >
                      <Trash2 />
                      <span>Delete Plan</span>
                    </ContextMenuItem>
                  </ContextMenuContent>
                )}

                {editingPlan && (
                  <ContextMenuContent>
                    <ContextMenuItem
                      className="flex items-center gap-2"
                      onClick={handleEditPlan}
                    >
                      <Save />
                      <span>Save Changes</span>
                    </ContextMenuItem>

                    <ContextMenuItem
                      className="flex items-center gap-2"
                      onClick={() => setEditingPlan(null)}
                    >
                      <X />
                      <span>Discard Changes</span>
                    </ContextMenuItem>
                  </ContextMenuContent>
                )}
              </ContextMenu>
            ))}
          </TableBody>
        </Table>
      </PageContent>

      <AlertDialog
        open={!!deletingPlan}
        onOpenChange={() => setDeletingPlan(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subscription Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the subscription plan "
              {deletingPlan?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlan}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageCard>
  );
}
