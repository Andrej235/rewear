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
import { EllipsisVertical, Shield, Trash2, User2 } from "lucide-react";
import { useState } from "react";
import { api } from "../../../lib/api.client";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const users = useQuery(api, "/users/all", {
    parameters: {
      limit: 25,
      offset: 0,
    },
    queryKey: ["admin-users"],
  });

  const [deletingUser, setDeletingUser] =
    useState<Schema<"AdminUserResponseDto"> | null>(null);

  async function handlePromote(user: Schema<"AdminUserResponseDto">) {
    const { isOk } = await api.sendRequest(
      "/users/{id}/set-as-admin",
      {
        method: "patch",
        parameters: {
          id: user.id,
        },
      },
      {
        toasts: {
          success: "User promoted to admin successfully",
          loading: "Promoting user to admin...",
          error: (e: Error) => e.message || "Failed to promote user to admin",
        },
      },
    );

    if (!isOk) return;

    await queryClient.setQueryData(
      ["admin-users"],
      (oldData: Schema<"AdminUserResponseDto">[]) => {
        if (!oldData) return oldData;

        return oldData.map((u: Schema<"AdminUserResponseDto">) =>
          u.id === user.id ? { ...u, role: "Admin" } : u,
        );
      },
    );
  }

  async function handleDemote(user: Schema<"AdminUserResponseDto">) {
    const { isOk } = await api.sendRequest(
      "/users/{id}/set-as-user",
      {
        method: "patch",
        parameters: {
          id: user.id,
        },
      },
      {
        toasts: {
          success: "Admin rights revoked successfully",
          loading: "Revoking admin rights...",
          error: (e: Error) => e.message || "Failed to revoke admin rights",
        },
      },
    );

    if (!isOk) return;

    await queryClient.setQueryData(
      ["admin-users"],
      (oldData: Schema<"AdminUserResponseDto">[]) => {
        if (!oldData) return oldData;

        return oldData.map((u: Schema<"AdminUserResponseDto">) =>
          u.id === user.id ? { ...u, role: "User" } : u,
        );
      },
    );
  }

  async function handleDeleteUser() {
    if (!deletingUser) return;

    const { isOk } = await api.sendRequest(
      "/users/{id}",
      {
        method: "delete",
        parameters: {
          id: deletingUser.id,
        },
      },
      {
        toasts: {
          success: "User deleted successfully",
          loading: "Deleting user...",
          error: (e: Error) => e.message || "Failed to delete user",
        },
      },
    );

    if (!isOk) return;

    await queryClient.setQueryData(
      ["admin-users"],
      (oldData: Schema<"AdminUserResponseDto">[]) => {
        if (!oldData) return oldData;

        return oldData.filter(
          (u: Schema<"AdminUserResponseDto">) => u.id !== deletingUser.id,
        );
      },
    );

    setDeletingUser(null);
  }

  if (users.isLoading) return <LoadingScreen />;

  return (
    <PageCard>
      <PageHeader>
        <PageTitle>Users</PageTitle>
        <PageDescription>Manage application users</PageDescription>
      </PageHeader>

      <PageContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Subscription Plan</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.data?.map((user) => (
              <ContextMenu key={user.id}>
                <ContextMenuTrigger asChild>
                  <TableRow>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      <span>{user.email}</span>
                      {!user.verified && (
                        <Badge className="ml-2" variant="destructive">
                          Unverified
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{user.role}</TableCell>
                    {/* TODO: Implement */}
                    <TableCell>{"Premium"}</TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <EllipsisVertical />
                        </DropdownMenuTrigger>

                        <DropdownMenuContent>
                          <DropdownMenuItem
                            className="flex items-center gap-2"
                            onClick={() =>
                              user.role === "Admin"
                                ? handleDemote(user)
                                : handlePromote(user)
                            }
                          >
                            {user.role === "Admin" ? <User2 /> : <Shield />}

                            <span>
                              {user.role === "Admin"
                                ? "Revoke Admin"
                                : "Make Admin"}
                            </span>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            variant="destructive"
                            className="flex items-center gap-2"
                            onClick={() => setDeletingUser(user)}
                          >
                            <Trash2 />
                            <span>Delete User</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                </ContextMenuTrigger>

                <ContextMenuContent>
                  <ContextMenuItem
                    className="flex items-center gap-2"
                    onClick={() =>
                      user.role === "Admin"
                        ? handleDemote(user)
                        : handlePromote(user)
                    }
                  >
                    {user.role === "Admin" ? <User2 /> : <Shield />}

                    <span>
                      {user.role === "Admin" ? "Revoke Admin" : "Make Admin"}
                    </span>
                  </ContextMenuItem>

                  <ContextMenuSeparator />

                  <ContextMenuItem
                    variant="destructive"
                    className="flex items-center gap-2"
                    onClick={() => setDeletingUser(user)}
                  >
                    <Trash2 />
                    <span>Delete User</span>
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </TableBody>
        </Table>
      </PageContent>

      <AlertDialog
        open={!!deletingUser}
        onOpenChange={() => setDeletingUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete user "{deletingUser?.username}"?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This action cannot be undone. All data associated with this user
              will be permanently deleted. They may stay logged in until their
              session expires.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction onClick={handleDeleteUser}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageCard>
  );
}
