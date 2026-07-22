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
  if (url.startsWith("/")) return url;
  if (url.includes("wsrv.nl")) return url;
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&output=webp&q=80`;
}
