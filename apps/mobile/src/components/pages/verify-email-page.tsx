import { useUserStore } from "@repo/lib/stores/user-store";
import { EmailVerification } from "@repo/ui/email-verification";
import { useNavigate } from "react-router";
import { api } from "../../lib/api";

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const user = useUserStore((x) => x.user!);

  return <EmailVerification api={api} navigate={navigate} user={user} />;
}
