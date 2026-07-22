import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getArticles } from "../services/cms";
import type { Category } from "../types/api";
import { ArticleCard } from "./ArticleCard";
import { Loading } from "./Loading";

export function Sidebar({ categories }: { categories: Category[] }) {
  const [loadSecondaryContent, setLoadSecondaryContent] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoadSecondaryContent(true), 800);
    return () => window.clearTimeout(timer);
  }, []);

  const popular = useQuery({
    queryKey: ["popular-articles"],
    queryFn: () => getArticles({ limit: 5, sort: "views", order: "desc" }),
    enabled: loadSecondaryContent,
    placeholderData: (previousData) => previousData,
    staleTime: 10 * 60 * 1000
  });

  const questions = useQuery({
    queryKey: ["question-articles"],
    queryFn: () => getArticles({ limit: 4, categorySlug: "hoi-dap" }),
    enabled: loadSecondaryContent,
    placeholderData: (previousData) => previousData,
    staleTime: 10 * 60 * 1000
  });

  return (
    <aside className="space-y-8">
      <section>
        <h2 className="border-l-4 border-primary pl-3 text-[1.1rem] font-extrabold uppercase tracking-tight text-slate-900">
          Chuyên mục
        </h2>
        <div className="mt-4 flex flex-col space-y-1">
          {categories.map((category) => (
            <Link
              key={category.slug}
              to={`/${category.slug}`}
              className="py-2 text-sm font-bold text-slate-700 transition-colors hover:text-primary"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="border-l-4 border-primary pl-3 text-[1.1rem] font-extrabold uppercase tracking-tight text-slate-900">
          Bài xem nhiều
        </h2>
        <div className="mt-3">
          {!loadSecondaryContent || popular.isLoading ? (
            <Loading label="Đang tải bài viết" variant="compact" count={5} />
          ) : (
            popular.data?.data.map((article) => <ArticleCard key={article._id} article={article} compact />)
          )}
        </div>
      </section>

      <section>
        <h2 className="border-l-4 border-primary pl-3 text-[1.1rem] font-extrabold uppercase tracking-tight text-slate-900">
          Hỏi đáp cùng luật sư
        </h2>
        <div className="mt-3">
          {!loadSecondaryContent || questions.isLoading ? (
            <Loading label="Đang tải hỏi đáp" variant="compact" count={4} />
          ) : (
            questions.data?.data.map((article) => <ArticleCard key={article._id} article={article} compact />)
          )}
        </div>
      </section>
    </aside>
  );
}
