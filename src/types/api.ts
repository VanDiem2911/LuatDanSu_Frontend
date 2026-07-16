export type Seo = {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  robots?: string;
};

export type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  type: "category" | "specialty";
  order: number;
  isVisible: boolean;
  seo?: Seo;
};

export type Article = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categorySlug: string;
  tagSlugs: string[];
  image?: string;
  authorName: string;
  status: "draft" | "published" | "archived";
  featured: boolean;
  views: number;
  publishedAt?: string;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
  seo?: Seo;
};

export type MenuItem = {
  label: string;
  href: string;
  order: number;
  isExternal?: boolean;
};

export type Menu = {
  _id: string;
  name: string;
  location: "header" | "footer" | "mobile";
  items: MenuItem[];
  isActive: boolean;
};

export type Setting = {
  _id: string;
  key: string;
  value: unknown;
  group: string;
  isPublic: boolean;
};

export type Banner = {
  _id: string;
  title: string;
  placement: "home" | "category" | "article" | "sidebar";
  image: string;
  href?: string;
  description?: string;
  isActive: boolean;
};

export type Page = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status: "draft" | "published" | "archived";
  seo?: Seo;
};

export type Video = {
  _id: string;
  title: string;
  youtubeId: string;
  order: number;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Paginated<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type ApiEnvelope<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

export type NavigationPayload = {
  menus: Menu[];
  categories: Category[];
  settings: Setting[];
};
