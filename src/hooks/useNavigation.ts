import { useQuery } from "@tanstack/react-query";
import { getNavigation } from "../services/cms";
import { queryKeys } from "../services/queryKeys";

export function useNavigation() {
  return useQuery({
    queryKey: queryKeys.navigation,
    queryFn: getNavigation,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    gcTime: 5 * 60_000
  });
}
