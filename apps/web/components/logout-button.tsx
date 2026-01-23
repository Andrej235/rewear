"use client";
import { Slot } from "@radix-ui/react-slot";
import { useRouter } from "next/navigation";
import { ReactNode, useCallback } from "react";
import { api } from "../lib/api.client";

export function LogOutButton({ children }: { children?: ReactNode }) {
  const router = useRouter();

  const logout = useCallback(async () => {
    await api.logOut();
    router.push("/login");
  }, [router]);

  return <Slot onClick={logout}>{children}</Slot>;
}
