import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { AppFooter } from "../../../components/app-footer";
import { AppHeader } from "../../../components/app-header";
import { getApi } from "../../../lib/api.server";
import { getUser } from "../../../lib/get-user";

export default async function RootAppLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): Promise<ReactNode> {
  const api = getApi();
  const loggedIn = await api.isLoggedIn();
  if (!loggedIn) return redirect("/login");

  const user = await getUser();
  if (!user) return redirect("/login");

  if (!user.hasSubscription) return redirect("/setup");

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1">{children}</main>
      <AppFooter />
    </div>
  );
}
