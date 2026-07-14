import { Link } from "react-router-dom";
import { Seo } from "../components/Seo";

export function NotFoundPage() {
  return (
    <>
      <Seo title="404 | Luật Dân Sự" description="Không tìm thấy trang." />
      <main className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">404</p>
        <h1 className="mt-3 text-4xl font-black text-ink">Không tìm thấy trang</h1>
        <p className="mt-3 max-w-lg text-slate-500">Đường dẫn không tồn tại hoặc nội dung đã được chuyển sang chuyên mục khác.</p>
        <Link to="/" className="mt-8 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-hover">
          Về trang chủ
        </Link>
      </main>
    </>
  );
}
