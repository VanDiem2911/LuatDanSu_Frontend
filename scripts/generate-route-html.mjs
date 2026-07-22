import { mkdir, readFile, writeFile } from "node:fs/promises";

const distDir = new URL("../dist/", import.meta.url);
const baseHtml = await readFile(new URL("./index.html", distDir), "utf8");
const configuredApi = process.env.VITE_API_URL || "http://127.0.0.1:3001/api";
const apiBase = configuredApi.replace(/\/+$/, "").endsWith("/api")
  ? configuredApi.replace(/\/+$/, "")
  : `${configuredApi.replace(/\/+$/, "")}/api`;

function escapeAttribute(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function safeSegment(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9-]/g, "");
}

function optimizedImageUrl(url, width) {
  if (url.includes("wsrv.nl")) {
    const optimized = new URL(url);
    optimized.searchParams.set("w", String(width));
    optimized.searchParams.set("output", "webp");
    optimized.searchParams.set("q", "72");
    return optimized.toString();
  }
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&output=webp&q=72`;
}

function routeHtml({ title, description, image, sizes }) {
  let html = baseHtml;
  if (title) {
    html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeAttribute(title)}</title>`);
  }
  if (description) {
    html = html.replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
      `<meta name="description" content="${escapeAttribute(description)}" />`
    );
  }
  if (image) {
    const widths = [360, 480, 640, 800];
    const href = optimizedImageUrl(image, 800);
    const srcset = widths.map((width) => `${optimizedImageUrl(image, width)} ${width}w`).join(", ");
    const preload = `<link rel="preload" as="image" href="${escapeAttribute(href)}" imagesrcset="${escapeAttribute(srcset)}" imagesizes="${escapeAttribute(sizes)}" fetchpriority="high" />`;
    html = html.replace("</head>", `    ${preload}\n  </head>`);
  }
  return html;
}

async function apiJson(path) {
  const response = await fetch(`${apiBase}${path}`, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`${response.status} ${path}`);
  return response.json();
}

async function writeRoute(route, html) {
  const segments = route.split("/").filter(Boolean).map(safeSegment).filter(Boolean);
  if (segments.length === 0) return;
  const fileName = `${segments.pop()}.html`;
  const directory = new URL(`./${segments.length ? `${segments.join("/")}/` : ""}`, distDir);
  await mkdir(directory, { recursive: true });
  await writeFile(new URL(fileName, directory), html);
}

try {
  const categoryResponse = await apiJson("/public/categories?limit=100&sort=order&order=asc");
  const categories = categoryResponse.data ?? [];
  const categoryPayloads = await Promise.all(
    categories.map(async (category) => ({
      category,
      articles: (await apiJson(`/public/articles?categorySlug=${encodeURIComponent(category.slug)}&limit=10000&sort=publishedAt&order=desc`)).data ?? []
    }))
  );

  const writes = [];
  for (const { category, articles } of categoryPayloads) {
    const categorySlug = safeSegment(category.slug);
    if (!categorySlug) continue;
    writes.push(
      writeRoute(
        categorySlug,
        routeHtml({
          title: category.seo?.metaTitle || `${category.name} | Luật Dân Sự`,
          description: category.seo?.metaDescription || category.description,
          image: articles[0]?.image,
          sizes: "(min-width: 1024px) 590px, calc(100vw - 32px)"
        })
      )
    );

    for (const article of articles) {
      const articleSlug = safeSegment(article.slug || article._id);
      if (!articleSlug) continue;
      writes.push(
        writeRoute(
          `${categorySlug}/${articleSlug}`,
          routeHtml({
            title: article.seo?.metaTitle || `${article.title} | Luật Dân Sự`,
            description: article.seo?.metaDescription || article.excerpt,
            image: article.image,
            sizes: "(min-width: 1024px) 760px, calc(100vw - 32px)"
          })
        )
      );
    }
  }

  for (const route of ["tim-kiem", "gioi-thieu", "lien-he", "dang-ky-tu-van"]) {
    writes.push(writeRoute(route, baseHtml));
  }

  await Promise.all(writes);
  console.log(`Generated ${writes.length} route HTML files with early LCP discovery.`);
} catch (error) {
  console.warn(`Route HTML generation skipped: ${error instanceof Error ? error.message : String(error)}`);
}
