import type { QueryClient } from "@tanstack/react-query";
import { getArticle, getCategoryPage, getNavigation, getSearchArticles } from "./cms";
import { queryKeys } from "./queryKeys";

const STALE_TIME = 5 * 60_000;
const CATEGORY_SLUGS = new Set(["tin-tuc", "dat-dai", "thua-ke", "ly-hon", "hoi-dap", "bieu-mau"]);

export function warmInitialRoute(queryClient: QueryClient) {
  void queryClient.prefetchQuery({ queryKey: queryKeys.navigation, queryFn: getNavigation, staleTime: 10 * 60_000 });

  const url = new URL(window.location.href);
  const segments = url.pathname.split("/").filter(Boolean);
  const [first = "", second = ""] = segments;

  if (segments.length === 1 && CATEGORY_SLUGS.has(first)) {
    void queryClient.prefetchQuery({ queryKey: queryKeys.categoryPage(first), queryFn: () => getCategoryPage(first), staleTime: STALE_TIME });
    return;
  }

  if (segments.length === 2 && first !== "admin") {
    void queryClient.prefetchQuery({ queryKey: queryKeys.article(first, second), queryFn: () => getArticle(second, first), staleTime: STALE_TIME });
    return;
  }

  if (first === "gioi-thieu") {
    return;
  }

  if (first === "tim-kiem") {
    const query = url.searchParams.get("q")?.trim() ?? "";
    if (query) {
      void queryClient.prefetchQuery({ queryKey: queryKeys.search(query), queryFn: () => getSearchArticles(query), staleTime: STALE_TIME });
    }
  }
}
