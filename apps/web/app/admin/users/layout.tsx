import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Users",
};

export default function AdminUsersLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
