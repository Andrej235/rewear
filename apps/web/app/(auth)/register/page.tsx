"use client";
import { SignupForm } from "@repo/ui/signup-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { JSX } from "react";
import { api } from "../../../lib/api.client";

export default function RegisterPage(): JSX.Element {
  const router = useRouter();

  return (
    <div className="grid h-screen w-screen place-items-center">
      <SignupForm api={api} navigate={router.push} LinkComp={Link} />
    </div>
  );
}
