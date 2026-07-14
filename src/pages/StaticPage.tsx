import { useQuery } from "@tanstack/react-query";
import { Breadcrumb } from "../components/Breadcrumb";
import { ErrorState } from "../components/ErrorState";
import { Loading } from "../components/Loading";
import { Seo } from "../components/Seo";
import { getPage } from "../services/cms";

export function StaticPage({ slug }: { slug: string }) {
  const page = useQuery({ queryKey: ["page", slug], queryFn: () => getPage(slug) });

  if (page.isLoading) return <Loading />;
  if (page.isError || !page.data) return <ErrorState title="Không tìm thấy trang" />;

  return (
    <>
      <Seo title={page.data.seo?.metaTitle ?? `${page.data.title} | Luật Dân Sự`} description={page.data.excerpt} />
      <main className="container-page py-10">
        <Breadcrumb items={[{ label: page.data.title }]} />
        <article className="max-w-3xl bg-white p-8">
          <h1 className="mb-6 text-4xl font-bold text-ink">{page.data.title}</h1>
          <div className="prose-content" dangerouslySetInnerHTML={{ __html: page.data.content }} />
        </article>
      </main>
    </>
  );
}
