import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

type Props = {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
};

const SITE_URL = "https://luatdansu.vercel.app";

export function Seo({ title, description, canonical, image, type = "website", noindex = false }: Props) {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const finalCanonical = canonical ?? `${SITE_URL}${currentPath}`;
  const finalDescription =
    description ?? "Cổng thông tin pháp lý chuyên sâu về dân sự, đất đai, hôn nhân gia đình, thừa kế.";

  const finalImage = image
    ? image.startsWith("http")
      ? image
      : `${SITE_URL}${image.startsWith("/") ? "" : "/"}${image}`
    : `${SITE_URL}/logo.png`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={finalDescription} />
      <meta name="robots" content={noindex ? "noindex, follow" : "index, follow"} />
      <link rel="canonical" href={finalCanonical} />
      
      {/* Open Graph / Facebook / Zalo */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={finalCanonical} />
      <meta property="og:locale" content="vi_VN" />
      <meta property="og:image" content={finalImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
    </Helmet>
  );
}

