type LoadingVariant = "page" | "hero" | "list" | "cards" | "article" | "compact" | "table";

type LoadingProps = {
  label?: string;
  variant?: LoadingVariant;
  count?: number;
};

function Block({ className }: { className: string }) {
  return <span className={`skeleton-block block ${className}`} aria-hidden="true" />;
}

function CompactRows({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex gap-3 border-b border-slate-100 pb-4 last:border-0">
          <Block className="h-11 w-11 flex-none rounded-full" />
          <div className="min-w-0 flex-1 space-y-2 pt-1">
            <Block className="h-3 w-2/3 rounded" />
            <Block className="h-3 w-full rounded" />
            <Block className="h-3 w-4/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ListRows({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="grid gap-5 border-b border-slate-200 pb-5 sm:grid-cols-[210px_1fr]">
          <Block className="aspect-[16/10] w-full rounded-sm" />
          <div className="space-y-3 py-1">
            <Block className="h-3 w-24 rounded" />
            <Block className="h-5 w-11/12 rounded" />
            <Block className="h-4 w-full rounded" />
            <Block className="h-4 w-4/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CardGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="border border-slate-200 bg-white p-4">
          <Block className="mb-4 aspect-[16/9] w-full rounded-sm" />
          <Block className="h-3 w-20 rounded" />
          <Block className="mt-3 h-4 w-full rounded" />
          <Block className="mt-2 h-4 w-4/5 rounded" />
        </div>
      ))}
    </div>
  );
}

function HeroFrame() {
  return (
    <div className="grid min-h-[650px] gap-8 lg:grid-cols-[1.55fr_0.7fr_0.8fr]">
      <div>
        <Block className="aspect-[16/7] w-full rounded-sm" />
        <div className="space-y-3 py-5">
          <Block className="h-3 w-24 rounded" />
          <Block className="h-7 w-10/12 rounded" />
          <Block className="h-4 w-full rounded" />
        </div>
        <div className="grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index}>
              <Block className="aspect-[16/9] w-full rounded-sm" />
              <Block className="mt-3 h-3 w-16 rounded" />
              <Block className="mt-2 h-4 w-full rounded" />
            </div>
          ))}
        </div>
      </div>
      <CompactRows count={6} />
      <div className="border border-slate-200 bg-white p-6">
        <Block className="mx-auto h-12 w-12 rounded-full" />
        <Block className="mx-auto mt-5 h-5 w-3/4 rounded" />
        <Block className="mx-auto mt-3 h-3 w-full rounded" />
        <Block className="mt-6 aspect-[16/10] w-full rounded-sm" />
        <Block className="mt-5 h-10 w-full rounded-full" />
      </div>
    </div>
  );
}

function ArticleFrame() {
  return (
    <div className="container-page py-10">
      <div className="mb-9 space-y-4 border-b border-slate-200 pb-8">
        <Block className="h-3 w-36 rounded" />
        <Block className="h-9 w-10/12 rounded" />
        <Block className="h-9 w-7/12 rounded" />
        <Block className="h-3 w-72 max-w-full rounded" />
      </div>
      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <Block className="mb-7 aspect-video w-full rounded-sm" />
          <div className="space-y-4">
            <Block className="h-4 w-full rounded" />
            <Block className="h-4 w-11/12 rounded" />
            <Block className="h-4 w-full rounded" />
            <Block className="h-4 w-4/5 rounded" />
            <Block className="mt-7 h-5 w-2/5 rounded" />
            <Block className="h-4 w-full rounded" />
            <Block className="h-4 w-10/12 rounded" />
          </div>
        </div>
        <CompactRows count={5} />
      </div>
    </div>
  );
}

function TableFrame() {
  return (
    <div className="w-full p-4 sm:p-6">
      <Block className="mb-5 h-11 w-full rounded" />
      <div className="space-y-1">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="grid grid-cols-[1fr_1.4fr_1fr_90px] gap-4 border-b border-slate-100 py-4">
            <Block className="h-4 w-full rounded" />
            <Block className="h-4 w-full rounded" />
            <Block className="h-4 w-4/5 rounded" />
            <Block className="h-4 w-full rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function PageFrame() {
  return (
    <main className="container-page py-10 md:py-12">
      <div className="mb-10 space-y-3 border-b border-slate-200 pb-7">
        <Block className="h-8 w-3/4 max-w-3xl rounded" />
        <Block className="h-4 w-1/2 max-w-xl rounded" />
      </div>
      <HeroFrame />
      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px]">
        <ListRows count={3} />
        <CompactRows count={4} />
      </div>
    </main>
  );
}

export function Loading({ label = "Đang tải dữ liệu", variant = "list", count }: LoadingProps) {
  let frame;

  switch (variant) {
    case "page":
      frame = <PageFrame />;
      break;
    case "hero":
      frame = <HeroFrame />;
      break;
    case "cards":
      frame = <CardGrid />;
      break;
    case "article":
      frame = <ArticleFrame />;
      break;
    case "compact":
      frame = <CompactRows count={count ?? 4} />;
      break;
    case "table":
      frame = <TableFrame />;
      break;
    default:
      frame = <ListRows />;
  }

  return (
    <div role="status" aria-live="polite" aria-busy="true" className="loading-frame w-full">
      <span className="sr-only">{label}</span>
      {frame}
    </div>
  );
}
