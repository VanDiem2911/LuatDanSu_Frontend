import { api } from "./http";
import type { ApiEnvelope, Article, Banner, Category, CategoryPagePayload, NavigationPayload, Page, Paginated, Video } from "../types/api";
import { preloadFirstHtmlImage, preloadOptimizedImage } from "../utils/format";

export type AdminDashboardData = {
  counts: Record<"articles" | "leads" | "comments" | "videos", number>;
  recentLeads: Record<string, unknown>[];
};

const staticPageFallbacks: Record<string, Page> = {
  "gioi-thieu": {
    _id: "gioi-thieu",
    slug: "gioi-thieu",
    title: "Giới thiệu Luật Dân Sự",
    excerpt: "Cổng thông tin pháp lý dân sự do đội ngũ Luật ANP xây dựng và cập nhật.",
    content: `<p>Luật Dân Sự là cổng thông tin pháp lý do Công ty Luật TNHH ANP xây dựng, cung cấp kiến thức thực tiễn về dân sự, đất đai, hôn nhân gia đình và thừa kế.</p><h2>Nội dung chuyên môn</h2><p>Các bài viết được trình bày ngắn gọn, dễ tra cứu và thường xuyên cập nhật theo quy định pháp luật hiện hành.</p><h2>Hỗ trợ pháp lý</h2><p>Đội ngũ luật sư và chuyên viên pháp lý tiếp nhận câu hỏi, tư vấn hướng xử lý phù hợp với từng vụ việc cụ thể.</p>`,
    status: "published",
    seo: {
      metaTitle: "Giới thiệu | Luật Dân Sự",
      metaDescription: "Giới thiệu cổng thông tin pháp lý Luật Dân Sự và đội ngũ Luật ANP."
    }
  }
};

export function getStaticPageFallback(slug: string) {
  return staticPageFallbacks[slug];
}

export async function getNavigation() {
  const response = await api.get<ApiEnvelope<NavigationPayload>>("/public/navigation");
  return response.data.data;
}

export async function getArticles(params?: Record<string, unknown>) {
  const response = await api.get<Paginated<Article>>("/public/articles", { params });
  return response.data;
}

export async function getSearchArticles(search: string) {
  const result = await getArticles({ search, limit: 20 });
  preloadOptimizedImage(result.data[0]?.image, 640, [320, 480, 640], "(min-width: 1024px) 400px, (min-width: 768px) 50vw, calc(100vw - 32px)");
  return result;
}

export async function getCategoryPage(slug: string) {
  try {
    const response = await api.get<ApiEnvelope<CategoryPagePayload>>(`/public/category-page/${slug}`);
    preloadOptimizedImage(response.data.data.featuredArticles[0]?.image, 800, [360, 480, 640, 800], "(min-width: 1024px) 590px, calc(100vw - 32px)");
    return response.data.data;
  } catch {
    const [category, featured] = await Promise.all([
      getCategory(slug),
      getArticles({ categorySlug: slug, limit: 12, sort: "publishedAt", order: "desc" })
    ]);
    preloadOptimizedImage(featured.data[0]?.image, 800, [360, 480, 640, 800], "(min-width: 1024px) 590px, calc(100vw - 32px)");
    return {
      category,
      featuredArticles: featured.data,
      articles: {
        data: featured.data.slice(0, 9),
        meta: { ...featured.meta, limit: 9, totalPages: Math.ceil(featured.meta.total / 9) }
      }
    };
  }
}

export async function getArticle(idOrSlug: string, categorySlug?: string) {
  const response = await api.get<ApiEnvelope<Article>>(`/public/articles/${idOrSlug}`, {
    params: categorySlug ? { categorySlug } : undefined
  });
  preloadOptimizedImage(response.data.data.image, 800, [360, 480, 640, 800], "(min-width: 1024px) 760px, calc(100vw - 32px)");
  return response.data.data;
}

export async function getCategory(slug: string) {
  const response = await api.get<ApiEnvelope<Category>>(`/public/categories/${slug}`);
  return response.data.data;
}

export async function getBanners(params?: Record<string, unknown>) {
  const response = await api.get<Paginated<Banner>>("/public/banners", { params });
  return response.data;
}

export async function getVideos(params?: Record<string, unknown>) {
  const response = await api.get<Paginated<Video>>("/public/videos", { params });
  return response.data;
}

export async function getPage(slug: string) {
  try {
    const response = await api.get<ApiEnvelope<Page>>(`/public/pages/${slug}`);
    preloadFirstHtmlImage(response.data.data.content, 900);
    return response.data.data;
  } catch (error) {
    const fallback = getStaticPageFallback(slug);
    if (fallback) return fallback;
    throw error;
  }
}

export async function submitLead(payload: { phone: string; source?: string }) {
  const response = await api.post<ApiEnvelope<unknown>>("/public/leads", payload);
  return response.data.data;
}

export async function submitQuestion(payload: { content: string; name?: string; email?: string }) {
  const response = await api.post<ApiEnvelope<unknown>>("/public/comments", {
    name: payload.name ?? "Khách truy cập",
    email: payload.email ?? "guest@luatdansu.local",
    content: payload.content,
    status: "pending"
  });
  return response.data.data;
}

export async function login(payload: { email: string; password: string }) {
  const response = await api.post<ApiEnvelope<{ token: string; user: unknown }>>("/auth/login", payload);
  return response.data.data;
}

export async function listAdminResource(resource: string, params?: Record<string, unknown>) {
  const response = await api.get<Paginated<Record<string, unknown>>>(`/admin/${resource}`, { params });
  return response.data;
}

export async function getAdminDashboard() {
  const response = await api.get<ApiEnvelope<AdminDashboardData>>("/admin/dashboard");
  return response.data.data;
}

export async function createAdminResource(resource: string, payload: Record<string, unknown>) {
  const response = await api.post<ApiEnvelope<Record<string, unknown>>>(`/admin/${resource}`, payload);
  return response.data.data;
}

export async function updateAdminResource(resource: string, id: string, payload: Record<string, unknown>) {
  const response = await api.put<ApiEnvelope<Record<string, unknown>>>(`/admin/${resource}/${id}`, payload);
  return response.data.data;
}

export async function deleteAdminResource(resource: string, id: string) {
  const response = await api.delete<ApiEnvelope<Record<string, unknown>>>(`/admin/${resource}/${id}`);
  return response.data.data;
}

export async function uploadMedia(file: File, folder = "library") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await api.post<ApiEnvelope<{ url: string }>>("/admin/media/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data.data;
}

export async function getBackupData() {
  const response = await api.get<Record<string, unknown[]>>("/admin/backup");
  return response.data;
}
