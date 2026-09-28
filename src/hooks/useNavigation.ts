import { useQuery } from "@tanstack/react-query";
import { getNavigation } from "../services/cms";
import { queryKeys } from "../services/queryKeys";

export function useNavigation() {
  return useQuery({
    queryKey: queryKeys.navigation,
    queryFn: getNavigation,
    staleTime: 0,
    refetchOnWindowFocus: true,
    gcTime: 60_000
  });
}
