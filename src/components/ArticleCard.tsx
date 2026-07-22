import { Calendar, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Article, Category } from "../types/api";
import { formatDate, optimizedImageUrl } from "../utils/format";

type Props = {
  article: Article;
  category?: Category;
  compact?: boolean;
};

export function ArticleCard({ article, category, compact = false }: Props) {
  const href = `/${article.categorySlug}/${article.slug || article._id}`;

  if (compact) {
    return (
      <Link to={href} className="group flex gap-3 border-b border-slate-100 py-3 last:border-b-0">
        <div className="h-16 w-20 flex-shrink-0 overflow-hidden bg-slate-100 flex items-center justify-center">
          {article.image ? (
            <img
              src={optimizedImageUrl(article.image, 160)}
              alt={article.title}
              width={80}
              height={64}
              decoding="async"
              loading="lazy"
              className={`h-full w-full ${
                article.image.toLowerCase().includes("logo") ? "object-contain bg-white p-1.5" : "object-cover"
              }`}
            />
          ) : null}
        </div>
        <div>
          <h3 className="line-clamp-2 text-sm font-bold leading-5 text-slate-800 group-hover:text-primary">
            {article.title}
          </h3>
          <p className="mt-1 text-xs text-slate-400">{formatDate(article.publishedAt ?? article.createdAt)}</p>
        </div>
      </Link>
    );
  }

  return (
    <article className="group bg-white transition-shadow hover:shadow-soft">
      <Link to={href} className="block">
        <div className="aspect-[16/9] overflow-hidden bg-slate-100 flex items-center justify-center">
          {article.image ? (
            <img
              src={optimizedImageUrl(article.image, 400)}
              alt={article.title}
              width={400}
              height={225}
              decoding="async"
              loading="lazy"
              className={`h-full w-full transition-transform duration-300 group-hover:scale-105 ${
                article.image.toLowerCase().includes("logo") ? "object-contain bg-white p-3" : "object-cover"
              }`}
            />
          ) : null}
        </div>
        <div className="border border-t-0 border-slate-100 p-5">
          <div className="mb-3 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wider text-primary">
            <span>{category?.name ?? article.categorySlug}</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(article.publishedAt ?? article.createdAt)}
            </span>
          </div>
          <h3 className="line-clamp-2 text-xl font-extrabold leading-7 text-ink group-hover:text-primary">
            {article.title}
          </h3>
          <p className="line-clamp-3 mt-3 text-sm leading-6 text-slate-600">{article.excerpt}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary">
            Đọc tiếp <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </article>
  );
}
