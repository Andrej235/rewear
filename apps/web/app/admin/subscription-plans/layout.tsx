import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Subscription Plans",
};

export default function AdminSubscriptionPlansLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
