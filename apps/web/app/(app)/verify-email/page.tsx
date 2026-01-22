import { JSX } from "react";
import { EmailVerification } from "../../../components/email-verification";
import { getUser } from "../../../lib/get-user";

export default async function VerifyEmailPage(): Promise<JSX.Element> {
  const user = await getUser();

  return (
    <div className="grid h-screen w-screen place-items-center">
      <EmailVerification user={user!} />
    </div>
  );
}
