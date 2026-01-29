import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Clothing Items",
};

export default function AdminClothingItemsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
