import { Calendar, Tag, User, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useOutletContext, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Breadcrumb } from "../components/Breadcrumb";
import { BreadcrumbJsonLd } from "../components/JsonLd";
import { ErrorState } from "../components/ErrorState";
import { Loading } from "../components/Loading";
import { Seo } from "../components/Seo";
import { Sidebar } from "../components/Sidebar";
import { getArticle } from "../services/cms";
import type { NavigationPayload } from "../types/api";
import { formatDate } from "../utils/format";

const SITE_URL = "https://luatdansu.vercel.app";

export function ArticlePage() {
  const { categorySlug = "", articleSlug = "" } = useParams();
  const navigation = useOutletContext<NavigationPayload>();
  const article = useQuery({
    queryKey: ["article", categorySlug, articleSlug],
    queryFn: () => getArticle(articleSlug, categorySlug),
    staleTime: 5 * 60 * 1000
  });

  if (article.isLoading) return <Loading variant="article" />;
  if (article.isError || !article.data) return <ErrorState title="Không tìm thấy bài viết" />;

  const category = navigation.categories.find((item) => item.slug === article.data.categorySlug);
  const articleUrl = `${SITE_URL}/${article.data.categorySlug}/${article.data.slug || article.data._id}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl
    },
    headline: article.data.title,
    image: article.data.image ? [article.data.image] : [`${SITE_URL}/logo.png`],
    datePublished: article.data.publishedAt || article.data.createdAt,
    dateModified: article.data.updatedAt || article.data.publishedAt || article.data.createdAt,
    author: [{ "@type": "Organization", name: "Luật ANP", url: SITE_URL }],
    publisher: {
      "@type": "Organization",
      name: "Luật Dân Sự - Luật ANP",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`
      }
    },
    description: article.data.excerpt
  };

  const breadcrumbItems = [
    { label: category?.name ?? article.data.categorySlug, href: `/${article.data.categorySlug}` },
    { label: article.data.title }
  ];

  return (
    <>
      <Seo
        title={article.data.seo?.metaTitle ?? `${article.data.title} | Luật Dân Sự`}
        description={article.data.seo?.metaDescription ?? article.data.excerpt}
        image={article.data.image}
        type="article"
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <div className="border-b border-slate-100 bg-white py-8">
        <div className="container-page">
          <Breadcrumb items={breadcrumbItems} />
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
                  width={800}
                  height={450}
                  fetchPriority="high"
                  decoding="async"
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
            {article.data.fileUrl ? (
              <div className="my-8 rounded-lg border border-blue-100 bg-blue-50/50 p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#282973] text-white">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Tài liệu đính kèm</h4>
                    <p className="text-xs text-slate-500">Tải về mẫu đơn khởi kiện chuẩn từ Luật sư</p>
                  </div>
                </div>
                <a
                  href={getDownloadUrl(article.data.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-xs font-black uppercase text-white hover:bg-primary-hover shadow transition whitespace-nowrap"
                >
                  Tải mẫu đơn tại đây
                </a>
              </div>
            ) : null}
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

function getDownloadUrl(url?: string) {
  if (!url) return "";
  
  let filename = "document.docx";
  try {
    const parsedUrl = new URL(url);
    const paramName = parsedUrl.searchParams.get("filename");
    if (paramName) {
      filename = paramName;
    }
  } catch (e) {
    // Ignore URL parse error
  }

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001/api";
  const baseUrl = API_URL.replace(/\/api$/, "");
  return `${baseUrl}/api/public/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
}
