"use client";
import { LoginForm } from "@repo/ui/auth/login-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { JSX } from "react";
import { api } from "../../../lib/api.client";

export default function LoginPage(): JSX.Element {
  const router = useRouter();

  return (
    <div className="grid h-screen w-screen place-items-center">
      <LoginForm
        api={api}
        onLogin={() => router.push("/clothes")}
        LinkComp={Link}
      />
    </div>
  );
}
