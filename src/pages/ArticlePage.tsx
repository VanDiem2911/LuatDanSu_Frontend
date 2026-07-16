import { Calendar, Tag, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useOutletContext, useParams } from "react-router-dom";
import { Breadcrumb } from "../components/Breadcrumb";
import { ErrorState } from "../components/ErrorState";
import { Loading } from "../components/Loading";
import { Seo } from "../components/Seo";
import { Sidebar } from "../components/Sidebar";
import { getArticle } from "../services/cms";
import type { NavigationPayload } from "../types/api";
import { formatDate } from "../utils/format";

export function ArticlePage() {
  const { categorySlug = "", articleSlug = "" } = useParams();
  const navigation = useOutletContext<NavigationPayload>();
  const article = useQuery({
    queryKey: ["article", categorySlug, articleSlug],
    queryFn: () => getArticle(articleSlug, categorySlug)
  });

  if (article.isLoading) return <Loading variant="article" />;
  if (article.isError || !article.data) return <ErrorState title="Không tìm thấy bài viết" />;

  const category = navigation.categories.find((item) => item.slug === article.data.categorySlug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.data.title,
    image: article.data.image ? [article.data.image] : [],
    datePublished: article.data.publishedAt,
    dateModified: article.data.updatedAt,
    author: [{ "@type": "Organization", name: "Luật Dân Sự - Luật ANP" }],
    publisher: { "@type": "Organization", name: "Luật Dân Sự - Luật ANP" },
    description: article.data.excerpt
  };

  return (
    <>
      <Seo
        title={article.data.seo?.metaTitle ?? `${article.data.title} | Luật Dân Sự`}
        description={article.data.seo?.metaDescription ?? article.data.excerpt}
        image={article.data.image}
        type="article"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="border-b border-slate-100 bg-white py-8">
        <div className="container-page">
          <Breadcrumb
            items={[
              { label: category?.name ?? article.data.categorySlug, href: `/${article.data.categorySlug}` },
              { label: article.data.title }
            ]}
          />
          <h1 className="mb-6 text-3xl font-bold leading-tight text-ink md:text-5xl">{article.data.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-[0.9rem] text-slate-500">
            <span className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <strong className="text-slate-700">{article.data.authorName}</strong>
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              {formatDate(article.data.publishedAt ?? article.data.createdAt)}
            </span>
            <span className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-slate-400" />
              <span className="px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
                {category?.name ?? article.data.categorySlug}
              </span>
            </span>
          </div>
        </div>
      </div>

      <main className="container-page py-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <article className="min-w-0 lg:col-span-8">
            {article.data.image ? (
              <div className="mb-8 aspect-video w-full overflow-hidden flex items-center justify-center bg-slate-100">
                <img
                  src={article.data.image}
                  alt={article.data.title}
                  className={`h-full w-full ${
                    article.data.image.toLowerCase().includes("logo") ? "object-contain bg-white p-6" : "object-cover"
                  }`}
                />
              </div>
            ) : null}
            <div
              className="prose-content"
              dangerouslySetInnerHTML={{ __html: article.data.content }}
            />
            <div className="mt-12 border-t border-slate-100 pt-8">
              <span className="text-sm font-bold uppercase tracking-widest text-slate-900">Chia sẻ:</span>
              <button
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="ml-4 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:border-primary hover:text-primary"
              >
                Sao chép đường dẫn
              </button>
            </div>
          </article>
          <div className="lg:col-span-4">
            <Sidebar categories={navigation.categories} />
          </div>
        </div>
      </main>
    </>
  );
}
