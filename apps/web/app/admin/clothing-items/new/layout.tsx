import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "New Clothing Item",
};

export default function AdminClothingItemLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
