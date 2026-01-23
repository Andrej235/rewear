import { notFound } from "next/navigation";
import { ReactNode } from "react";
import { AppShell } from "../../components/app-shell";
import { getApi } from "../../lib/api.server";
import { getUser } from "../../lib/get-user";

export default async function RootAdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): Promise<ReactNode> {
  const api = getApi();
  const isAdmin = await api.isAdmin();
  if (!isAdmin) return notFound();

  const user = await getUser();
  if (!user) return notFound();

  return <AppShell user={user}>{children}</AppShell>;
}
