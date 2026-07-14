import { useState } from "react";
import {
  BarChart3,
  FileQuestion,
  FileText,
  LayoutDashboard,
  LogOut,
  PhoneCall,
  Settings,
  UserRound,
  Video,
  Menu,
  X
} from "lucide-react";
import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";

const resources = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Câu hỏi", href: "/admin/comments", icon: FileQuestion },
  { label: "Bài viết", href: "/admin/articles", icon: FileText },
  { label: "Biểu mẫu", href: "/admin/articles?categorySlug=bieu-mau", icon: FileText },
  { label: "Videos", href: "/admin/videos", icon: Video },
  { label: "Thống kê SĐT", href: "/admin/leads", icon: PhoneCall },
  { label: "Cấu hình", href: "/admin/settings", icon: Settings }
];

function AdminLogo() {
  return (
    <div className="grid h-12 w-[110px] grid-rows-[1fr_auto] bg-navy text-white shadow-sm">
      <div className="grid grid-cols-[1fr_34px] items-center border-b border-white/25">
        <span className="pl-2 font-serif text-[1.7rem] font-black leading-none tracking-wide">LAW</span>
        <span className="flex h-full items-center justify-center border-l border-white/25">
          <BarChart3 className="h-5 w-5" strokeWidth={1.5} />
        </span>
      </div>
      <span className="pb-0.5 text-center font-serif text-[0.62rem] font-semibold uppercase tracking-[0.24em]">Luatdansu</span>
    </div>
  );
}

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = window.localStorage.getItem("admin_token");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!token) return <Navigate to="/admin/login" replace />;

  function logout() {
    window.localStorage.removeItem("admin_token");
    navigate("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-[88px] items-center justify-center border-b border-slate-200">
          <AdminLogo />
        </div>
        <nav className="p-5">
          <p className="mb-4 border-l-4 border-primary pl-3 text-lg font-black uppercase text-slate-950">Quản trị</p>
          {resources.map((item) => {
            const Icon = item.icon;
            const current = `${location.pathname}${location.search}`;
            const isActive = current === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`mb-2 flex items-center gap-4 rounded-md px-5 py-4 text-base font-bold transition ${
                  isActive ? "bg-slate-100 text-primary" : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                }`}
              >
                <Icon className="h-5 w-5 text-current" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 px-8 py-5 text-sm font-semibold text-slate-500">
          © 2026 Luật Dân Sự
        </div>
      </aside>
      <main className="lg:pl-64">
        <header className="flex h-[88px] items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8 shadow-sm">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="inline-flex p-2 text-slate-600 hover:text-primary lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="hidden sm:inline text-xl md:text-2xl font-black uppercase text-slate-800">
            Hệ thống quản lý
          </span>
          <div className="ml-auto mr-4 md:mr-8 flex items-center gap-2 md:gap-4">
            <span className="flex h-9 w-9 md:h-11 md:w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserRound className="h-4 w-4 md:h-5 md:w-5" />
            </span>
            <span className="text-sm md:text-lg font-bold text-slate-600">Admin</span>
          </div>
          <button onClick={logout} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary">
            <LogOut className="h-5 w-5" />
          </button>
        </header>
        <div className="p-4 md:p-8 lg:p-12">
          <Outlet />
        </div>
      </main>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen ? (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-[150] bg-slate-950/50 transition-opacity lg:hidden"
        />
      ) : null}

      {/* Mobile Menu Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-[200] w-64 border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[88px] items-center justify-between px-6 border-b border-slate-200">
          <AdminLogo />
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-5">
          <p className="mb-4 border-l-4 border-primary pl-3 text-lg font-black uppercase text-slate-950">Quản trị</p>
          {resources.map((item) => {
            const Icon = item.icon;
            const current = `${location.pathname}${location.search}`;
            const isActive = current === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`mb-2 flex items-center gap-4 rounded-md px-5 py-4 text-base font-bold transition ${
                  isActive ? "bg-slate-100 text-primary" : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                }`}
              >
                <Icon className="h-5 w-5 text-current" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
