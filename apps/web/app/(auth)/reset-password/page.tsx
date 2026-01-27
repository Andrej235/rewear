"use client";
import { ResetPassword } from "@repo/ui/auth/reset-password";
import { useRouter, useSearchParams } from "next/navigation";
import { JSX } from "react";
import { api } from "../../../lib/api.client";

export default function ResetPasswordPage(): JSX.Element {
  const router = useRouter();
  const params = useSearchParams();

  return (
    <div className="grid h-screen w-screen place-items-center">
      <ResetPassword api={api} navigate={router.push} params={params} />
    </div>
  );
}
