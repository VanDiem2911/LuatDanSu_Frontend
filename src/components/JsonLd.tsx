import { Helmet } from "react-helmet-async";

const SITE_URL = "https://luatdansu.vercel.app";

export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: "Luật ANP - Cổng Thông Tin Pháp Lý Luật Dân Sự",
    alternateName: "Luật Dân Sự ANP",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    image: `${SITE_URL}/consult-banner.jpg`,
    description: "Công ty Luật TNHH ANP - Chuyên tư vấn pháp luật dân sự, đất đai, hôn nhân gia đình, thừa kế.",
    telephone: "0903601234",
    email: "congtyluatanp.hcm@gmail.com",
    address: [
      {
        "@type": "PostalAddress",
        streetAddress: "Tầng 5 Tòa nhà 290 Tây Sơn, P. Trung Liệt, Q. Đống Đa",
        addressLocality: "Hà Nội",
        addressCountry: "VN"
      },
      {
        "@type": "PostalAddress",
        streetAddress: "Tầng 9 Tòa nhà 167 Đinh Bộ Lĩnh, P. 26, Q. Bình Thạnh",
        addressLocality: "TP. Hồ Chí Minh",
        addressCountry: "VN"
      }
    ],
    priceRange: "Free - Consult"
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export function BreadcrumbJsonLd({ items }: { items: { label: string; href?: string }[] }) {
  const listItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Trang chủ",
      item: SITE_URL
    },
    ...items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 2,
      name: item.label,
      ...(item.href ? { item: item.href.startsWith("http") ? item.href : `${SITE_URL}${item.href}` } : {})
    }))
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: listItems
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export function FaqJsonLd({ questions }: { questions: { question: string; answer: string }[] }) {
  if (!questions || questions.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
