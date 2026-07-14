import { BriefcaseBusiness, Calendar, ChevronRight, FileText, Play, Scale, Zap, Heart, Home, Coins } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import { ErrorState } from "../components/ErrorState";
import { LeadForms } from "../components/LeadForms";
import { Loading } from "../components/Loading";
import { Seo } from "../components/Seo";
import { Sidebar } from "../components/Sidebar";
import { ConsultBanner } from "../components/ConsultBanner";
import { getArticles, getBanners, getVideos, submitLead } from "../services/cms";
import type { Article, Category, NavigationPayload, Video } from "../types/api";
import { formatDate } from "../utils/format";
import { isValidPhone, PATTERNS, VALIDATION_MESSAGES } from "../utils/validation";

function articleHref(article: Article) {
  return `/${article.categorySlug}/${article.slug || article._id}`;
}

function categoryLabel(categories: Category[], slug: string) {
  return categories.find((category) => category.slug === slug)?.name ?? slug;
}

function SectionHeading({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4 border-t border-slate-200 pt-6">
      <h2 className="section-title">{title}</h2>
      {href && linkLabel ? (
        <Link to={href} className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-hover">
          {linkLabel}
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

function ShortArticleList({ articles, categories }: { articles: Article[]; categories: Category[] }) {
  return (
    <div className="divide-y divide-slate-200 sm:border-x sm:border-slate-200 sm:px-6 lg:px-7">
      {articles.map((article) => (
        <Link key={article._id} to={articleHref(article)} className="group block py-3.5 first:pt-0">
          <span className="text-xs font-bold uppercase tracking-wide text-primary">
            {categoryLabel(categories, article.categorySlug)}
          </span>
          <h3 className="mt-1 line-clamp-2 text-[1.02rem] font-extrabold leading-6 text-slate-800 group-hover:text-primary">
            {article.title}
          </h3>
        </Link>
      ))}
    </div>
  );
}

function ConsultationCard({ image: _image }: { image?: string }) {
  return (
    <aside className="flex flex-col border border-slate-200 bg-white px-6 py-6 text-center gap-4">
      <div className="mx-auto flex h-14 w-14 items-center justify-center text-primary">
        <Scale className="h-12 w-12" strokeWidth={1.8} />
      </div>
      <div>
        <div className="mb-2 flex items-center justify-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h2 className="text-[1.3rem] font-black uppercase text-navy">Tư vấn miễn phí</h2>
        </div>
        <p className="mx-auto max-w-[280px] text-xs font-semibold leading-relaxed text-slate-500">
          Luật sư nhiều kinh nghiệm giải đáp nhanh thắc mắc ngay hôm nay.
        </p>
      </div>
      <div className="aspect-[16/10] w-full overflow-hidden bg-[#fcece2] rounded">
        <img src="/lawyer.png" alt="Tư vấn luật" className="h-full w-full object-cover" loading="lazy" />
      </div>
      <div className="flex flex-col gap-2.5">
        <Link
          to="/lien-he"
          className="rounded-full bg-primary py-2.5 text-xs font-black uppercase text-white shadow-md shadow-indigo-100 transition hover:bg-primary-hover"
        >
          Đăng ký ngay
        </Link>
        <a href="tel:0903601234" className="rounded-full border border-slate-200 py-2.5 text-xs font-black text-primary hover:bg-slate-50">
          Gọi 090 360 1234
        </a>
        <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-slate-400 mt-1">* Hỗ trợ 24/7, bảo mật</p>
      </div>
    </aside>
  );
}


function HomeLeadArticle({ article, categories }: { article: Article; categories: Category[] }) {
  return (
    <article>
      <Link to={articleHref(article)} className="group block">
        <div className="aspect-[16/7] overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
          {article.image ? (
            <img
              src={article.image}
              alt={article.title}
              className={`h-full w-full transition group-hover:scale-[1.02] ${
                article.image.toLowerCase().includes("logo") ? "object-contain bg-white p-3" : "object-cover"
              }`}
            />
          ) : null}
        </div>
        <div className="pt-5">
          <span className="text-xs font-bold uppercase tracking-wide text-primary">
            {categoryLabel(categories, article.categorySlug)}
          </span>
          <h2 className="mt-2 text-[1.65rem] font-black leading-tight text-slate-950 transition group-hover:text-primary md:text-[2rem]">
            {article.title}
          </h2>
          <p className="mt-3 line-clamp-2 text-[1rem] font-medium leading-7 text-slate-500">{article.excerpt}</p>
        </div>
      </Link>
    </article>
  );
}

function ThumbnailStrip({ articles, categories }: { articles: Article[]; categories: Category[] }) {
  return (
    <div className="grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-3">
      {articles.map((article) => (
        <Link key={article._id} to={articleHref(article)} className="group block">
          <div className="aspect-[16/8] overflow-hidden bg-slate-100 flex items-center justify-center">
            {article.image ? (
              <img
                src={article.image}
                alt=""
                className={`h-full w-full transition group-hover:scale-105 ${
                  article.image.toLowerCase().includes("logo") ? "object-contain bg-white p-2" : "object-cover"
                }`}
              />
            ) : null}
          </div>
          <div className="pt-3">
            <span className="text-[0.7rem] font-bold uppercase tracking-wide text-primary">
              {categoryLabel(categories, article.categorySlug)}
            </span>
            <h3 className="mt-1 line-clamp-2 text-base font-extrabold leading-6 text-slate-800 group-hover:text-primary">
              {article.title}
            </h3>
          </div>
        </Link>
      ))}
    </div>
  );
}

function FormMiniCard({ article, categories }: { article: Article; categories: Category[] }) {
  return (
    <Link to={articleHref(article)} className="group flex w-full gap-4 border border-slate-200 bg-white p-4 hover:shadow-soft">
      <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
        <FileText className="h-7 w-7" />
      </span>
      <span className="min-w-0">
        <span className="text-[0.7rem] font-bold uppercase tracking-wide text-slate-400">
          {categoryLabel(categories, article.categorySlug)}
        </span>
        <span className="mt-1 block line-clamp-2 text-sm font-black leading-5 text-slate-800 group-hover:text-primary">
          {article.title}
        </span>
        <span className="mt-1 block line-clamp-2 text-xs font-medium leading-5 text-slate-500">{article.excerpt}</span>
      </span>
    </Link>
  );
}

function NewsRow({ article, categories }: { article: Article; categories: Category[] }) {
  return (
    <Link to={articleHref(article)} className="group grid gap-5 border-b border-slate-200 py-4 first:pt-0 sm:grid-cols-[210px_1fr]">
      <div className="aspect-[16/10] overflow-hidden bg-slate-100 flex items-center justify-center">
        {article.image ? (
          <img
            src={article.image}
            alt=""
            className={`h-full w-full transition group-hover:scale-105 ${
              article.image.toLowerCase().includes("logo") ? "object-contain bg-white p-2.5" : "object-cover"
            }`}
          />
        ) : null}
      </div>
      <div>
        <div className="mb-1 flex flex-wrap items-center gap-3 text-[0.7rem] font-bold uppercase tracking-wide text-primary">
          <span>{categoryLabel(categories, article.categorySlug)}</span>
          <span className="flex items-center gap-1 text-slate-400">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(article.publishedAt ?? article.createdAt)}
          </span>
        </div>
        <h3 className="line-clamp-2 text-xl font-black leading-7 text-slate-900 group-hover:text-primary">{article.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-slate-500">{article.excerpt}</p>
      </div>
    </Link>
  );
}

function getSpecialtyIcon(slug: string) {
  switch (slug) {
    case "ly-hon":
      return <Heart className="h-6 w-6" />;
    case "dat-dai":
      return <Home className="h-6 w-6" />;
    case "thua-ke":
      return <Coins className="h-6 w-6" />;
    default:
      return <BriefcaseBusiness className="h-6 w-6" />;
  }
}

function SpecialtySection({ categories }: { categories: Category[] }) {
  return (
    <section className="pb-12">
      <SectionHeading title="Giải thích luật theo lĩnh vực" />
      <div className="grid gap-5 md:grid-cols-3">
        {categories
          .filter((category) => category.type === "specialty")
          .slice(0, 3)
          .map((category) => (
            <Link key={category.slug} to={`/${category.slug}`} className="border border-slate-200 bg-white p-6 text-center hover:shadow-soft">
              <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                {getSpecialtyIcon(category.slug)}
              </span>
              <h3 className="text-lg font-black text-navy">{category.name}</h3>
              <p className="mx-auto mt-2 line-clamp-2 max-w-[280px] text-sm font-medium leading-6 text-slate-500">{category.description}</p>
              <span className="mt-5 inline-flex rounded-full bg-primary px-6 py-2.5 text-xs font-black text-white">
                Xem thêm
              </span>
            </Link>
          ))}
      </div>
    </section>
  );
}

function VideoSection({ videos }: { videos: Video[] }) {
  if (!videos || videos.length === 0) return null;

  // Duplicate list to ensure seamless infinite marquee looping
  const marqueeVideos = [...videos, ...videos];

  return (
    <section className="pb-12 overflow-hidden">
      <SectionHeading title="Video tư vấn pháp luật" />
      <div className="w-full overflow-hidden mt-4">
        <div className="marquee-track gap-5">
          {marqueeVideos.map((video, index) => (
            <article
              key={`${video._id}-${index}`}
              className="w-[280px] sm:w-[340px] flex-shrink-0 group bg-white border border-slate-200"
            >
              <div className="aspect-video overflow-hidden bg-slate-900">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${video.youtubeId}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              <div className="border border-t-0 border-slate-100 px-4 py-3">
                <h3 className="flex items-center gap-3 line-clamp-1 text-sm font-bold text-slate-800 group-hover:text-primary">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Play className="ml-0.5 h-4 w-4 fill-current" />
                  </span>
                  {video.title}
                </h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuestionRows({ articles, categories }: { articles: Article[]; categories: Category[] }) {
  return (
    <section className="pb-14">
      <SectionHeading title="Hỏi đáp nổi bật" href="/hoi-dap" linkLabel="Xem tất cả hỏi đáp pháp luật" />
      <div className="divide-y divide-slate-200">
        {articles.map((article) => (
          <Link key={article._id} to={articleHref(article)} className="group grid grid-cols-[64px_1fr] gap-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden bg-white text-navy border border-slate-100">
              {article.image ? (
                <img
                  src={article.image}
                  alt=""
                  className={`h-full w-full ${
                    article.image.toLowerCase().includes("logo") ? "object-contain bg-white p-1" : "object-cover"
                  }`}
                />
              ) : (
                <FileText className="h-7 w-7" />
              )}
            </div>
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-3 text-[0.68rem] font-bold uppercase tracking-wide text-slate-400">
                <span>{categoryLabel(categories, article.categorySlug)}</span>
                <span>{formatDate(article.publishedAt ?? article.createdAt)}</span>
              </div>
              <h3 className="line-clamp-1 text-base font-black text-slate-800 group-hover:text-primary">{article.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}



export function HomePage() {
  const navigation = useOutletContext<NavigationPayload>();
  const homeTopicSlug = "thua-ke";
  const homeTopic = useQuery({
    queryKey: ["articles", "home-topic", homeTopicSlug],
    queryFn: () => getArticles({ limit: 12, categorySlug: homeTopicSlug, sort: "publishedAt", order: "desc" })
  });
  const latest = useQuery({
    queryKey: ["articles", "home-latest"],
    queryFn: () => getArticles({ limit: 18, sort: "publishedAt", order: "desc" })
  });
  const forms = useQuery({
    queryKey: ["articles", "home-forms"],
    queryFn: () => getArticles({ limit: 4, categorySlug: "bieu-mau", sort: "publishedAt", order: "desc" })
  });
  const questions = useQuery({
    queryKey: ["articles", "home-questions"],
    queryFn: () => getArticles({ limit: 8, categorySlug: "hoi-dap", sort: "publishedAt", order: "desc" })
  });
  const videos = useQuery({
    queryKey: ["videos", "home"],
    queryFn: () => getVideos({ limit: 100, sort: "order", order: "asc" })
  });
  const banner = useQuery({ queryKey: ["banners", "home"], queryFn: () => getBanners({ limit: 1 }) });

  const topicArticles = homeTopic.data?.data ?? [];
  const leadArticle = useMemo(
    () => topicArticles.find((article) => article.image?.includes("congtyluatanp.com")) ?? topicArticles[0],
    [topicArticles]
  );
  const remainingTopicArticles = useMemo(
    () => topicArticles.filter((article) => article._id !== leadArticle?._id),
    [leadArticle?._id, topicArticles]
  );
  const headlineArticles = useMemo(() => remainingTopicArticles.slice(0, 7), [remainingTopicArticles]);
  const thumbnailArticles = useMemo(() => remainingTopicArticles.slice(1, 4), [remainingTopicArticles]);
  const newsArticles = useMemo(() => topicArticles.slice(0, 6), [topicArticles]);
  const questionArticles = questions.data?.data ?? [];
  const consultationImage = banner.data?.data[0]?.image ?? leadArticle?.image;

  return (
    <>
      <Seo title="Luật Dân Sự - Cổng thông tin pháp luật | Luật ANP" />
      <main className="container-page">
        <div className="mb-12 border-b border-slate-200 pb-6 pt-10 md:pt-12">
          <h1 className="max-w-none text-[2rem] font-black uppercase leading-tight text-navy md:text-[2.45rem]">
            Cổng thông tin pháp luật dân sự - Luật ANP
          </h1>
          <p className="mt-4 text-base font-semibold text-slate-500 md:text-lg">
            Hỗ trợ tra cứu biểu mẫu, hỏi đáp pháp lý trực tuyến và tin tức luật mới nhất
          </p>
        </div>

        {homeTopic.isLoading ? (
          <Loading label="Đang tải dữ liệu" variant="hero" />
        ) : homeTopic.isError || !leadArticle ? (
          <ErrorState />
        ) : (
          <section className="grid gap-8 lg:grid-cols-[1.65fr_0.72fr_0.82fr]">
            <div>
              <HomeLeadArticle article={leadArticle} categories={navigation.categories} />
              <ThumbnailStrip articles={thumbnailArticles} categories={navigation.categories} />
            </div>
            <ShortArticleList articles={headlineArticles} categories={navigation.categories} />
            <ConsultationCard image={consultationImage} />
          </section>
        )}

        <LeadForms />

        <section className="py-10">
          <SectionHeading title="Biểu mẫu" href="/bieu-mau" linkLabel="Xem tất cả biểu mẫu" />
          {forms.isLoading ? (
            <Loading variant="cards" />
          ) : forms.isError ? (
            <ErrorState />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 w-full">
              {forms.data?.data.slice(0, 4).map((article) => (
                <FormMiniCard key={article._id} article={article} categories={navigation.categories} />
              ))}
            </div>
          )}
        </section>

        <section className="pb-12">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
            <div>
              <SectionHeading title="Tin tức nổi bật" href="/tin-tuc" linkLabel="Xem tất cả tin tức" />
              <div>
                {newsArticles.map((article) => (
                  <NewsRow key={article._id} article={article} categories={navigation.categories} />
                ))}
              </div>
            </div>
            <Sidebar categories={navigation.categories} />
          </div>
        </section>

        <SpecialtySection categories={navigation.categories} />
        <VideoSection videos={videos.data?.data ?? []} />
        <QuestionRows articles={questionArticles} categories={navigation.categories} />
      </main>

      <ConsultBanner image={consultationImage} />
    </>
  );
}
