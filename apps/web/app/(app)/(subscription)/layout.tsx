import { redirect } from "next/navigation";
import { ReactNode } from "react";
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

  return children;
}
