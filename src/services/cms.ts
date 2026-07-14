import { api } from "./http";
import type { ApiEnvelope, Article, Banner, Category, NavigationPayload, Page, Paginated, Video } from "../types/api";

export async function getNavigation() {
  const response = await api.get<ApiEnvelope<NavigationPayload>>("/public/navigation");
  return response.data.data;
}

export async function getArticles(params?: Record<string, unknown>) {
  const response = await api.get<Paginated<Article>>("/public/articles", { params });
  return response.data;
}

export async function getArticle(idOrSlug: string) {
  const response = await api.get<ApiEnvelope<Article>>(`/public/articles/${idOrSlug}`);
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
  const response = await api.get<ApiEnvelope<Page>>(`/public/pages/${slug}`);
  return response.data.data;
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
