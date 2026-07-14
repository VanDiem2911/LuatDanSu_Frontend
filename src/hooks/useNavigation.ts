import { useQuery } from "@tanstack/react-query";
import { getNavigation } from "../services/cms";

export function useNavigation() {
  return useQuery({
    queryKey: ["navigation"],
    queryFn: getNavigation
  });
}
