import { SignupForm } from "@repo/ui/auth/signup-form";
import { JSX } from "react";
import { api } from "../../lib/api";
import { Link } from "../link";
import { useNavigate } from "react-router";

export function RegisterPage(): JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="grid h-screen w-screen place-items-center">
      <SignupForm
        className="w-[min(90vw,32rem)]"
        api={api}
        navigate={navigate}
        LinkComp={Link}
      />
    </div>
  );
}
