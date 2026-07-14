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
