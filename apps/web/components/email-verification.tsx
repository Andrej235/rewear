"use client";
import { Schema } from "@repo/lib/api/types/schema/schema-parser";
import { EmailVerification as EmailVerificationUI } from "@repo/ui/email-verification";
import { useRouter } from "next/navigation";
import { api } from "../lib/api.client";

export function EmailVerification({
  user,
}: {
  user: Schema<"UserResponseDto">;
}) {
  const router = useRouter();

  return <EmailVerificationUI api={api} navigate={router.push} user={user} />;
}
