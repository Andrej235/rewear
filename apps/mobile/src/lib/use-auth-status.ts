import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

export function useAuthStatus() {
  const query = useQuery({
    queryKey: ["user", "me", "check-auth"],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      return await api.isLoggedIn();
    },
  });

  return query;
}
