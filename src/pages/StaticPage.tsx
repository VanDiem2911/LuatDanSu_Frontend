import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Breadcrumb } from "../components/Breadcrumb";
import { BreadcrumbJsonLd } from "../components/JsonLd";
import { ErrorState } from "../components/ErrorState";
import { Loading } from "../components/Loading";
import { Seo } from "../components/Seo";
import { getPage, getStaticPageFallback } from "../services/cms";
import { queryKeys } from "../services/queryKeys";
import { optimizeHtmlImages } from "../utils/format";

export function StaticPage({ slug }: { slug: string }) {
  const page = useQuery({
    queryKey: queryKeys.page(slug),
    queryFn: () => getPage(slug),
    initialData: getStaticPageFallback(slug),
    initialDataUpdatedAt: 0,
    staleTime: 5 * 60 * 1000
  });
  const pageContent = useMemo(() => optimizeHtmlImages(page.data?.content, 900, true), [page.data?.content]);

  if (page.isLoading) return <Loading variant="article" />;
  if (page.isError || !page.data) return <ErrorState title="Không tìm thấy trang" />;

  return (
    <>
      <Seo title={page.data.seo?.metaTitle ?? `${page.data.title} | Luật Dân Sự`} description={page.data.excerpt} />
      <BreadcrumbJsonLd items={[{ label: page.data.title }]} />
      <main className="container-page py-10">
        <Breadcrumb items={[{ label: page.data.title }]} />
        <article className="max-w-3xl bg-white p-8">
          <h1 className="mb-6 text-4xl font-bold text-ink">{page.data.title}</h1>
          <div className="prose-content" dangerouslySetInnerHTML={{ __html: pageContent }} />
        </article>
      </main>
    </>
  );
}
