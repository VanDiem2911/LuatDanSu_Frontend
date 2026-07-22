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

export function optimizedImageUrl(url?: string, width = 600) {
  if (!url) return "";
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;
  const sourceUrl = url.startsWith("/") && typeof window !== "undefined" ? `${window.location.origin}${url}` : url;
  if (url.includes("wsrv.nl")) return url;
  return `https://wsrv.nl/?url=${encodeURIComponent(sourceUrl)}&w=${width}&output=webp&q=80`;
}

export function optimizeHtmlImages(html?: string, width = 800) {
  if (!html || typeof document === "undefined") return html ?? "";

  const doc = document.implementation.createHTMLDocument("");
  doc.body.innerHTML = html;
  doc.body.querySelectorAll("img").forEach((image) => {
    const src = image.getAttribute("src");
    if (src) {
      image.setAttribute("src", optimizedImageUrl(src, width));
    }
    image.setAttribute("width", image.getAttribute("width") || String(width));
    image.setAttribute("height", image.getAttribute("height") || String(Math.round((width * 9) / 16)));
    image.setAttribute("loading", "lazy");
    image.setAttribute("decoding", "async");
    image.setAttribute("class", `${image.getAttribute("class") ?? ""} content-image`.trim());
    if (!image.getAttribute("alt")) {
      image.setAttribute("alt", image.getAttribute("title") || "Hinh minh hoa bai viet");
    }
  });

  return doc.body.innerHTML;
}
