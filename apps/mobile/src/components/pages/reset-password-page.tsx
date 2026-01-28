import { ResetPassword } from "@repo/ui/auth/reset-password";
import { useNavigate, useSearchParams } from "react-router";
import { api } from "../../lib/api";

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  return (
    <div className="grid h-screen w-screen place-items-center">
      <ResetPassword api={api} navigate={navigate} params={params} />
    </div>
  );
}
