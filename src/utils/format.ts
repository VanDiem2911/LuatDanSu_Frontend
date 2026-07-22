export function formatDate(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

export function settingValue<T>(settings: Array<{ key: string; value: unknown }> | undefined, key: string, fallback: T): T {
  const setting = settings?.find((item) => item.key === key);
  return (setting?.value as T | undefined) ?? fallback;
}

const DEFAULT_IMAGE_QUALITY = 72;
const SITE_URL = "https://luatdansu.vercel.app";

function absoluteImageUrl(url: string) {
  if (!url.startsWith("/")) return url;
  return `${typeof window !== "undefined" ? window.location.origin : SITE_URL}${url}`;
}

export function optimizedImageUrl(url?: string, width = 600, quality = DEFAULT_IMAGE_QUALITY) {
  if (!url) return "";
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;
  if (url.includes("wsrv.nl")) {
    const optimized = new URL(url);
    optimized.searchParams.set("w", String(width));
    optimized.searchParams.set("output", "webp");
    optimized.searchParams.set("q", String(quality));
    return optimized.toString();
  }
  return `https://wsrv.nl/?url=${encodeURIComponent(absoluteImageUrl(url))}&w=${width}&output=webp&q=${quality}`;
}

export function optimizedImageSrcSet(url?: string, widths = [320, 480, 640, 800], quality = DEFAULT_IMAGE_QUALITY) {
  if (!url || url.startsWith("data:") || url.startsWith("blob:")) return undefined;
  return widths.map((width) => `${optimizedImageUrl(url, width, quality)} ${width}w`).join(", ");
}

export function preloadOptimizedImage(
  url?: string,
  width = 800,
  widths = [360, 480, 640, 800],
  sizes = "100vw"
) {
  if (!url || typeof document === "undefined") return;

  const href = optimizedImageUrl(url, width);
  const exists = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="image"]')).some(
    (link) => link.href === href
  );
  if (exists) return;

  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = href;
  link.setAttribute("fetchpriority", "high");
  link.setAttribute("imagesrcset", optimizedImageSrcSet(url, widths) ?? "");
  link.setAttribute("imagesizes", sizes);
  document.head.appendChild(link);
}

export function preloadFirstHtmlImage(html?: string, width = 900) {
  if (!html || typeof document === "undefined") return;
  const doc = document.implementation.createHTMLDocument("");
  doc.body.innerHTML = html;
  preloadOptimizedImage(doc.body.querySelector("img")?.getAttribute("src") ?? undefined, width, [480, 720, 900], "(min-width: 1024px) 768px, calc(100vw - 64px)");
}

export function optimizeHtmlImages(html?: string, width = 800, priorityFirst = false) {
  if (!html || typeof document === "undefined") return html ?? "";

  const doc = document.implementation.createHTMLDocument("");
  doc.body.innerHTML = html;
  doc.body.querySelectorAll("img").forEach((image, index) => {
    const src = image.getAttribute("src");
    if (src) {
      image.setAttribute("src", optimizedImageUrl(src, width));
      image.setAttribute("srcset", optimizedImageSrcSet(src, [480, 720, width]) ?? "");
      image.setAttribute("sizes", "(min-width: 1024px) 768px, calc(100vw - 64px)");
    }
    image.setAttribute("width", image.getAttribute("width") || String(width));
    image.setAttribute("height", image.getAttribute("height") || String(Math.round((width * 9) / 16)));
    image.setAttribute("loading", priorityFirst && index === 0 ? "eager" : "lazy");
    if (priorityFirst && index === 0) {
      image.setAttribute("fetchpriority", "high");
    }
    image.setAttribute("decoding", "async");
    image.setAttribute("class", `${image.getAttribute("class") ?? ""} content-image`.trim());
    if (!image.getAttribute("alt")) {
      image.setAttribute("alt", image.getAttribute("title") || "Hình minh họa bài viết");
    }
  });

  return doc.body.innerHTML;
}
