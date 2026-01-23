import { notFound } from "next/navigation";
import { ReactNode } from "react";
import { AppShell } from "../../components/app-shell";
import { getApi } from "../../lib/api.server";
import { getUser } from "../../lib/get-user";
import { SidebarInset, SidebarProvider } from "@repo/ui/common/sidebar";
import { AdminSidebar } from "../../components/admin-sidebar/admin-sidebar";

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

  return (
    <AppShell user={user}>
      <SidebarProvider>
        <AdminSidebar />

        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </AppShell>
  );
}
