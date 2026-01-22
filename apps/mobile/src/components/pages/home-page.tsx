import { Button } from "@repo/ui/common/button";
import { Link } from "react-router";

export function HomePage() {
  return (
    <div>
      <h1 className="mb-2 text-center text-lg">
        Hello World! <span className="text-muted-foreground">(mobile)</span>
      </h1>

      <div className="space-x-2">
        <Button asChild>
          <Link to="/login">Login</Link>
        </Button>

        <Button asChild>
          <Link to="/verify-email">Verify email</Link>
        </Button>
      </div>
    </div>
  );
}
