import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="fixed top-0 right-0 bottom-0 left-0 grid place-items-center bg-background">
      <Loader2 className="size-8 animate-spin" />
    </div>
  );
}
