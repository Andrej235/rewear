import { Toaster } from "@repo/ui/common/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { JSX } from "react";
import { Outlet } from "react-router";

const queryClient = new QueryClient();

export function App(): JSX.Element {
  return (
    <>
      <div className="grid h-screen w-screen place-items-center">
        <QueryClientProvider client={queryClient}>
          <Outlet />
        </QueryClientProvider>
      </div>

      <Toaster richColors />
    </>
  );
}
