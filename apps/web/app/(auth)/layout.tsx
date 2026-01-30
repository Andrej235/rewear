import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { getApi } from "../../lib/api.server";

export default async function RootAuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): Promise<ReactNode> {
  const api = getApi();
  const loggedIn = await api.isLoggedIn();
  if (loggedIn) return redirect("/clothes");

  return children;
}
