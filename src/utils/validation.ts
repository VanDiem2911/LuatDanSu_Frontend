export const PATTERNS = {
  phone: "^(\\+84|84|0)([\\s.-]?\\d){8,10}$",
  email: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
  slug: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
  url: "^https?:\\/\\/[^\\s]+$",
  youtubeId: "^[A-Za-z0-9_-]{6,20}$"
};

export const REGEX = {
  phone: new RegExp(PATTERNS.phone),
  email: new RegExp(PATTERNS.email),
  slug: new RegExp(PATTERNS.slug),
  url: new RegExp(PATTERNS.url),
  youtubeId: new RegExp(PATTERNS.youtubeId)
};

export const VALIDATION_MESSAGES = {
  phone: "Số điện thoại phải bắt đầu bằng 0, 84 hoặc +84 và có 9-11 số.",
  email: "Email không đúng định dạng.",
  slug: "Slug chỉ dùng chữ thường, số và dấu gạch ngang.",
  url: "Link phải bắt đầu bằng http:// hoặc https://.",
  youtubeId: "YouTube ID chỉ gồm chữ, số, dấu gạch dưới hoặc gạch ngang."
};

export function isValidPhone(value: string) {
  return REGEX.phone.test(value.trim());
}

export function isValidEmail(value: string) {
  return REGEX.email.test(value.trim());
}
