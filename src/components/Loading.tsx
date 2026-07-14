import { LoaderCircle } from "lucide-react";

export function Loading({ label = "Đang tải dữ liệu" }: { label?: string }) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center gap-3 text-primary">
      <LoaderCircle className="h-9 w-9 animate-spin" aria-hidden="true" />
      <span className="text-sm font-semibold text-slate-500">{label}</span>
    </div>
  );
}
