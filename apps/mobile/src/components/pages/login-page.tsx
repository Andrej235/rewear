import { LoginForm } from "@repo/ui/auth/login-form";
import { useQueryClient } from "@tanstack/react-query";
import { JSX } from "react";
import { useNavigate } from "react-router";
import { api } from "../../lib/api";
import { Link } from "../link";

export function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const client = useQueryClient();

  return (
    <div className="grid h-screen w-screen place-items-center">
      <LoginForm
        className="w-[min(90vw,32rem)]"
        api={api}
        onLogin={async () => {
          await client.invalidateQueries({
            queryKey: ["user", "me"],
            exact: false,
          });
          navigate("/");
        }}
        LinkComp={Link}
      />
    </div>
  );
}
