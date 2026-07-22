import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useOutletContext, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb } from "../components/Breadcrumb";
import { BreadcrumbJsonLd, FaqJsonLd } from "../components/JsonLd";
import { ConsultBanner } from "../components/ConsultBanner";
import { ErrorState } from "../components/ErrorState";
import { Loading } from "../components/Loading";
import { Seo } from "../components/Seo";
import { Sidebar } from "../components/Sidebar";
import { getArticles, getCategory } from "../services/cms";
import { ChevronRight, Play, Scale, Search, Zap } from "lucide-react";
import type { Article, Category, NavigationPayload } from "../types/api";

const headingCopy: Record<string, { title: string; description: string }> = {
  "tin-tuc": {
    title: "Tin tức Pháp luật",
    description: "Cập nhật những thay đổi mới nhất về chính sách, nghị định và thông tin pháp lý quan trọng trong đời sống dân sự."
  },
  "hoi-dap": {
    title: "Hỏi đáp Pháp luật",
    description: "Nơi giải đáp mọi thắc mắc của bạn về các vấn đề pháp lý dân sự bởi đội ngũ chuyên gia dày dạn kinh nghiệm."
  },
  "dat-dai": {
    title: "Luật Đất đai",
    description: "Tổng hợp các quy định về quyền sử dụng đất, thủ tục hành chính, bồi thường giải tỏa và tranh chấp ranh giới."
  },
  "ly-hon": {
    title: "Luật Hôn nhân & Gia đình",
    description: "Chuyên trang cung cấp kiến thức về thủ tục ly hôn, phân chia tài sản chung, quyền nuôi con và nghĩa vụ cấp dưỡng."
  },
  "thua-ke": {
    title: "Luật Thừa kế",
    description: "Tổng hợp các quy định về quyền thừa kế, cách lập di chúc hợp pháp, hàng thừa kế và giải quyết tranh chấp di sản."
  }
};

function href(article: Article) {
  return `/${article.categorySlug}/${article.slug || article._id}`;
}

function labelFor(category?: Category) {
  const labels: Record<string, string> = {
    "tin-tuc": "Tin tức",
    "bieu-mau": "Biểu mẫu",
    "hoi-dap": "Hỏi đáp",
    "ly-hon": "Ly hôn",
    "dat-dai": "Đất đai",
    "thua-ke": "Thừa kế"
  };
  return category ? labels[category.slug] ?? category.name : "";
}

function ConsultationCard({ image: _image }: { image?: string }) {
  return (
    <aside className="flex flex-col border border-slate-200 bg-white px-6 py-6 text-center gap-4">
      <div className="mx-auto flex h-14 w-14 items-center justify-center text-primary">
        <Scale className="h-12 w-12" strokeWidth={1.8} />
      </div>
      <div>
        <div className="mb-2 flex items-center justify-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <h2 className="text-[1.2rem] font-black uppercase text-navy">Tư vấn miễn phí</h2>
        </div>
        <p className="mx-auto max-w-[260px] text-xs font-semibold leading-relaxed text-slate-500">
          Luật sư nhiều kinh nghiệm giải đáp nhanh thắc mắc ngay hôm nay.
        </p>
      </div>
      <div className="aspect-[16/10] w-full overflow-hidden bg-[#fcece2] rounded">
        <img src="/lawyer.png" alt="Tư vấn luật" width={280} height={175} loading="lazy" decoding="async" className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-col gap-2.5">
        <Link to="/dang-ky-tu-van" className="rounded-full bg-primary py-2.5 text-xs font-black uppercase text-white shadow-md">
          Đăng ký ngay
        </Link>
        <a href="tel:0903601234" className="rounded-full border border-slate-200 py-2 text-xs font-black text-primary hover:bg-slate-50">
          Gọi 090 360 1234
        </a>
        <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-400 mt-1">* Hỗ trợ 24/7, bảo mật</p>
      </div>
    </aside>
  );
}


function TopStory({ article, category }: { article: Article; category: Category }) {
  return (
    <article>
      <Link to={href(article)} className="group block">
        <div className="aspect-[16/7] overflow-hidden bg-slate-100 flex items-center justify-center">
          {article.image ? (
            <img
              src={article.image}
              alt={article.title}
              width={800}
              height={350}
              fetchPriority="high"
              decoding="async"
              className={`h-full w-full transition group-hover:scale-[1.02] ${
                article.image.toLowerCase().includes("logo") ? "object-contain bg-white p-3" : "object-cover"
              }`}
            />
          ) : null}
        </div>
        <div className="pt-4">
          <span className="text-[0.7rem] font-bold uppercase tracking-wide text-primary">{labelFor(category)}</span>
          <h2 className="mt-1 line-clamp-2 text-[1.45rem] font-black leading-8 text-slate-950 group-hover:text-primary">
            {article.title}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-slate-500">{article.excerpt}</p>
        </div>
      </Link>
    </article>
  );
}

function SmallFeatureGrid({ articles, category }: { articles: Article[]; category: Category }) {
  return (
    <div className="grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-3">
      {articles.map((article) => (
        <Link key={article._id} to={href(article)} className="group block">
          <div className="aspect-[16/8] overflow-hidden bg-slate-100 flex items-center justify-center">
            {article.image ? (
              <img
                src={article.image}
                alt={article.title}
                width={400}
                height={200}
                loading="lazy"
                decoding="async"
                className={`h-full w-full transition group-hover:scale-105 ${
                  article.image.toLowerCase().includes("logo") ? "object-contain bg-white p-2" : "object-cover"
                }`}
              />
            ) : null}
          </div>
          <div className="pt-3">
            <span className="text-[0.68rem] font-bold uppercase tracking-wide text-primary">{labelFor(category)}</span>
            <h3 className="mt-1 line-clamp-2 text-sm font-black leading-5 text-slate-900 group-hover:text-primary">{article.title}</h3>
          </div>
        </Link>
      ))}
    </div>
  );
}

function HeadlineList({ articles, category }: { articles: Article[]; category: Category }) {
  return (
    <div className="divide-y divide-slate-200 sm:border-x sm:border-slate-200 sm:px-6">
      {articles.map((article) => (
        <Link key={article._id} to={href(article)} className="group block py-3 first:pt-0">
          <span className="text-[0.68rem] font-bold uppercase tracking-wide text-primary">{labelFor(category)}</span>
          <h3 className="mt-1 line-clamp-2 text-sm font-black leading-5 text-slate-900 group-hover:text-primary">{article.title}</h3>
        </Link>
      ))}
    </div>
  );
}

function ArticleRow({ article, category, question = false }: { article: Article; category: Category; question?: boolean }) {
  return (
    <Link to={href(article)} className="group grid gap-5 border-b border-slate-200 py-5 first:pt-0 sm:grid-cols-[230px_1fr]">
      <div className="aspect-[16/10] overflow-hidden bg-slate-100 flex items-center justify-center">
        {article.image ? (
          <img
            src={article.image}
            alt={article.title}
            width={320}
            height={200}
            loading="lazy"
            decoding="async"
            className={`h-full w-full transition group-hover:scale-105 ${
              article.image.toLowerCase().includes("logo") ? "object-contain bg-white p-2.5" : "object-cover"
            }`}
          />
        ) : null}
      </div>
      <div>
        <span className="text-[0.68rem] font-bold uppercase tracking-wide text-primary">{labelFor(category)}</span>
        <h2 className="mt-1 line-clamp-2 text-xl font-black leading-7 text-slate-900 group-hover:text-primary">{article.title}</h2>
        <p className="mt-2 line-clamp-3 text-sm font-medium leading-6 text-slate-500">
          {question ? <strong className="font-black text-primary">Trả lời: </strong> : null}
          {article.excerpt}
        </p>
      </div>
    </Link>
  );
}

function SidebarColumn({
  categories,
  search,
  onSearch
}: {
  categories: Category[];
  search: string;
  onSearch: (val: string) => void;
}) {
  const [query, setQuery] = useState(search);

  useEffect(() => {
    setQuery(search);
  }, [search]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(query.trim());
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSearch} className="flex items-center rounded-full border border-slate-200 bg-white px-4">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent px-3 py-3 text-sm outline-none"
          placeholder="Tìm kiếm bài viết..."
        />
        {search ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              onSearch("");
            }}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 ml-2 whitespace-nowrap"
          >
            Xóa
          </button>
        ) : null}
      </form>
      <Sidebar categories={categories} />
    </div>
  );
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1);
  return (
    <div className="mt-10 flex items-center justify-center gap-3">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="h-8 w-8 rounded-full border border-slate-200 bg-white text-slate-400 disabled:opacity-50">
        ‹
      </button>
      {pages.map((item) => (
        <button
          key={item}
          onClick={() => onChange(item)}
          className={`h-9 w-9 rounded-full text-sm font-black ${item === page ? "bg-primary text-white" : "bg-white text-slate-600"}`}
        >
          {item}
        </button>
      ))}
      {totalPages > 5 ? <span className="text-slate-400">...</span> : null}
      <button disabled={page >= totalPages} onClick={() => onChange(page + 1)} className="h-8 w-8 rounded-full border border-slate-200 bg-white text-slate-400 disabled:opacity-50">
        ›
      </button>
    </div>
  );
}

export function CategoryPage() {
  const { categorySlug = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  
  const [search, setSearch] = useState("");
  const navigation = useOutletContext<NavigationPayload>();
  const category = useQuery({ queryKey: ["category", categorySlug], queryFn: () => getCategory(categorySlug), staleTime: 5 * 60 * 1000 });

  useEffect(() => {
    setSearch("");
  }, [categorySlug]);

  const handlePageChange = (newPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    if (newPage > 1) {
      nextParams.set("page", newPage.toString());
    } else {
      nextParams.delete("page");
    }
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const featureArticles = useQuery({
    queryKey: ["articles", categorySlug, "feature"],
    queryFn: () => getArticles({ categorySlug, limit: 12, sort: "publishedAt", order: "desc" }),
    enabled: Boolean(categorySlug),
    staleTime: 5 * 60 * 1000
  });
  const articles = useQuery({
    queryKey: ["articles", categorySlug, "list", page, search],
    queryFn: () => getArticles({ categorySlug, page, limit: 9, sort: "publishedAt", order: "desc", search }),
    enabled: Boolean(categorySlug),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000
  });

  const copy = headingCopy[categorySlug];
  const isQuestionPage = categorySlug === "hoi-dap";
  const hasActiveSearch = Boolean(search);
  const hideTopSection = categorySlug === "hoi-dap" || categorySlug === "bieu-mau" || hasActiveSearch;
  const feature = featureArticles.data?.data ?? [];
  const lead = feature[0];
  const thumbnails = useMemo(() => feature.slice(1, 4), [feature]);
  const headlines = useMemo(() => feature.slice(4, 11), [feature]);

  if (category.isLoading) return <Loading variant="page" />;
  if (category.isError || !category.data) return <ErrorState title="Không tìm thấy chuyên mục" />;

  const title = copy?.title ?? category.data.name;
  const description = copy?.description ?? category.data.description;

  const breadcrumbItems = [{ label: title, href: `/${category.data.slug}` }];
  const faqItems = isQuestionPage && articles.data?.data
    ? articles.data.data.map((art) => ({ question: art.title, answer: art.excerpt || art.title }))
    : [];

  return (
    <>
      <Seo title={category.data.seo?.metaTitle ?? `${title} | Luật Dân Sự`} description={category.data.seo?.metaDescription ?? description} />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <FaqJsonLd questions={faqItems} />

      <div className="border-b border-slate-200 bg-white pb-12 pt-8">
        <div className="container-page">
          <Breadcrumb items={breadcrumbItems} />
          <div className="max-w-3xl">
            <h1 className="mb-4 text-3xl font-black leading-tight tracking-tight text-ink sm:text-4xl md:text-5xl">{title}</h1>
            <p className="max-w-2xl text-base font-medium leading-relaxed text-slate-500 sm:text-lg">{description}</p>
          </div>
        </div>
      </div>

      <main className="container-page py-14">
        {!hideTopSection && lead ? (
          <section className="mb-14 grid grid-cols-1 gap-8 lg:grid-cols-[1.55fr_0.7fr_0.8fr]">
            <div>
              <TopStory article={lead} category={category.data} />
              <SmallFeatureGrid articles={thumbnails} category={category.data} />
            </div>
            <HeadlineList articles={headlines} category={category.data} />
            <ConsultationCard />
          </section>
        ) : null}

        <section className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            {!isQuestionPage ? (
              <h2 className="section-title mb-8 text-[1.35rem]">
                {hasActiveSearch ? `Kết quả tìm kiếm cho: "${search}"` : "Bài viết mới nhất"}
              </h2>
            ) : hasActiveSearch ? (
              <h2 className="section-title mb-8 text-[1.35rem]">Kết quả tìm kiếm cho: "{search}"</h2>
            ) : null}
            {articles.isLoading ? (
              <Loading />
            ) : articles.isError ? (
              <ErrorState />
            ) : (
              <>
                <div>
                  {articles.data?.data.map((article) => (
                    <ArticleRow key={article._id} article={article} category={category.data} question={isQuestionPage} />
                  ))}
                </div>
                <Pagination page={page} totalPages={articles.data?.meta.totalPages ?? 1} onChange={handlePageChange} />
              </>
            )}
          </div>
          <SidebarColumn categories={navigation.categories} search={search} onSearch={(val) => { setSearch(val); handlePageChange(1); }} />
        </section>
      </main>
      <ConsultBanner />
    </>
  );
}
