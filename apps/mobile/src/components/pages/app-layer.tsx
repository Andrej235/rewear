import { useQuery } from "@repo/lib/api/use-query";
import { useUserStore } from "@repo/lib/stores/user-store";
import { LoadingScreen } from "@repo/ui/loading-screen";
import { useEffect } from "react";
import { Navigate, Outlet } from "react-router";
import { api } from "../../lib/api";
import { useAuthStatus as useAuthStatus } from "../../lib/use-auth-status";

// Only allow access to children if the user IS authenticated
export function AppLayer() {
  const authStatus = useAuthStatus();

  const user = useQuery(api, "/users/me", {
    queryKey: ["user", "me"],
    enabled: !!authStatus.data,
  });

  const setUser = useUserStore((state) => state.setUser);
  useEffect(() => {
    if (!user.data) return;

    setUser(user.data);
  }, [user.data, setUser]);

  if (authStatus.isLoading || user.isLoading) return <LoadingScreen />;
  if (!authStatus.data) return <Navigate to="/login" replace />;

  return (
    <div className="max-w-full px-4 text-wrap wrap-break-word">
      <Outlet />
    </div>
  );
}
