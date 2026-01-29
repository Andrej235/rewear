import { SidebarInset, SidebarProvider } from "@repo/ui/common/sidebar";
import { notFound } from "next/navigation";
import { ReactNode } from "react";
import { AdminHeader } from "../../components/admin/admin-header";
import { AdminSidebar } from "../../components/admin/admin-sidebar";
import { AppShell } from "../../components/app-shell";
import { getApi } from "../../lib/api.server";
import { getUser } from "../../lib/get-user";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Admin Panel",
    template: "%s - ReWear Admin Panel",
  },
};

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

        <SidebarInset>
          <AdminHeader />

          <main className="relative h-full p-4">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </AppShell>
  );
}
