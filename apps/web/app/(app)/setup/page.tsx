import { redirect } from "next/navigation";
import { SetupForm } from "../../../components/setup-form";
import { getUser } from "../../../lib/get-user";

export default async function SetupPage() {
  const user = await getUser();
  if (user?.hasSubscription) return redirect("/");

  return <SetupForm />;
}
