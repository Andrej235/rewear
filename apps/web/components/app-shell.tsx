"use client";
import { Schema } from "@repo/lib/api/types/schema/schema-parser";
import { useUserStore } from "@repo/lib/stores/user-store";
import { ReactNode, useState } from "react";

export function AppShell({
  user,
  children,
}: {
  user: Schema<"UserResponseDto">;
  children: ReactNode;
}) {
  const [hydrated] = useState(() => {
    useUserStore.setState({ user });
    return true;
  });

  if (!hydrated) return null;

  return children;
}
