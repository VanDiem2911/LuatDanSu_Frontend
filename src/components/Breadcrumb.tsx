import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

type Item = {
  label: string;
  href?: string;
};

export function Breadcrumb({ items }: { items: Item[] }) {
  return (
    <nav className="mb-6 flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-2 text-sm text-slate-500">
      <Link to="/" className="flex items-center gap-1 transition-colors hover:text-primary">
        <Home className="h-4 w-4" />
        Trang chủ
      </Link>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 flex-shrink-0" />
          {item.href ? (
            <Link to={item.href} className="font-bold text-[#282973] transition-colors hover:text-primary">
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-ink">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
