import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { ArticleCard } from "../components/ArticleCard";
import { Breadcrumb } from "../components/Breadcrumb";
import { BreadcrumbJsonLd } from "../components/JsonLd";
import { ErrorState } from "../components/ErrorState";
import { Loading } from "../components/Loading";
import { Seo } from "../components/Seo";
import { getSearchArticles } from "../services/cms";
import { queryKeys } from "../services/queryKeys";

export function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const articles = useQuery({
    queryKey: queryKeys.search(q),
    queryFn: () => getSearchArticles(q),
    enabled: q.length > 0,
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000
  });

  return (
    <>
      <Seo title={`Tìm kiếm ${q ? `"${q}"` : ""} | Luật Dân Sự`} noindex={true} />
      <BreadcrumbJsonLd items={[{ label: "Tìm kiếm" }]} />
      <main className="container-page py-10">
        <Breadcrumb items={[{ label: "Tìm kiếm" }]} />
        <h1 className="mb-6 text-4xl font-bold text-ink">Tìm kiếm</h1>
        <p className="mb-8 text-slate-500">Kết quả cho từ khóa: <strong>{q}</strong></p>
        {articles.isLoading ? (
          <Loading variant="cards" />
        ) : articles.isError ? (
          <ErrorState />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.data?.data.map((article, index) => <ArticleCard key={article._id} article={article} priority={index === 0} />)}
          </div>
        )}
      </main>
    </>
  );
}
