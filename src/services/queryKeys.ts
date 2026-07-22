export const queryKeys = {
  navigation: ["navigation"] as const,
  categoryPage: (slug: string) => ["category-page", slug] as const,
  article: (categorySlug: string, articleSlug: string) => ["article", categorySlug, articleSlug] as const,
  search: (query: string) => ["search", query] as const,
  page: (slug: string) => ["page", slug] as const
};
