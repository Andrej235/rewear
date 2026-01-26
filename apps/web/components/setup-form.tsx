"use client";
import { SetupForm as SetupFormUI } from "@repo/ui/setup-form/setup-form";
import { useRouter } from "next/navigation";
import { api } from "../lib/api.client";

export function SetupForm() {
  const router = useRouter();

  return (
    <div className="grid h-screen w-screen place-items-center">
      <SetupFormUI api={api} navigate={router.push} />
    </div>
  );
}
