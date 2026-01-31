import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Boxes",
};

export default function AdminBoxesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
