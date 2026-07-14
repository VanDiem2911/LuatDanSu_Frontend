import { Helmet } from "react-helmet-async";

type Props = {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: "website" | "article";
};

export function Seo({ title, description, canonical, image, type = "website" }: Props) {
  const finalDescription =
    description ?? "Cổng thông tin pháp lý chuyên sâu về dân sự, đất đai, hôn nhân gia đình, thừa kế.";

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={finalDescription} />
      <meta name="robots" content="index, follow" />
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="vi_VN" />
      {image ? <meta property="og:image" content={image} /> : null}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={finalDescription} />
      {image ? <meta name="twitter:image" content={image} /> : null}
    </Helmet>
  );
}
