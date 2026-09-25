import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PhoneCall,
  Settings,
  UserRound,
  Video,
  Menu,
  X
} from "lucide-react";
import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { listAdminResource } from "../services/cms";

const resources = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Câu hỏi", href: "/admin/comments", icon: MessageSquare },
  { label: "Bài viết", href: "/admin/posts", icon: FileText },
  { label: "Biểu mẫu", href: "/admin/forms", icon: FileText },
  { label: "Videos", href: "/admin/videos", icon: Video },
  { label: "Thống kê SĐT", href: "/admin/phones", icon: PhoneCall },
  { label: "Cấu hình", href: "/admin/settings", icon: Settings }
];

function AdminLogo() {
  const { data } = useQuery({
    queryKey: ["admin-site-logo"],
    queryFn: () => listAdminResource("settings", { limit: 10 }),
    staleTime: 60_000
  });
  const site = data?.data?.find((s: any) => s.key === "site")?.value as any;
  const logoUrl = site?.logoUrl || "/logo.webp";

  return (
    <Link to="/admin" className="flex items-center justify-center px-4" aria-label="Luật Dân Sự">
      <img
        src={logoUrl}
        alt="Luật Dân Sự"
        width={104}
        height={48}
        decoding="async"
        className="h-11 w-auto max-w-[180px] object-contain"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/logo.webp";
        }}
      />
    </Link>
  );
}

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = window.sessionStorage.getItem("admin_token");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!token) return <Navigate to="/admin/login" replace />;

  function logout() {
    window.sessionStorage.removeItem("admin_token");
    window.localStorage.removeItem("admin_token");
    navigate("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200/80 bg-white lg:block z-30">
        <div className="flex h-20 items-center justify-center border-b border-slate-100">
          <AdminLogo />
        </div>
        <nav className="p-4">
          <div className="mb-4 flex items-center gap-2 px-3">
            <span className="h-4 w-1 rounded-full bg-[#2563eb]" />
            <span className="text-sm font-bold uppercase tracking-wider text-slate-800">Quản trị</span>
          </div>
          {resources.map((item) => {
            const Icon = item.icon;
            const current = `${location.pathname}${location.search}`;
            const isActive =
              current === item.href ||
              (item.href === "/admin/posts" && (location.pathname === "/admin/posts" || (location.pathname === "/admin/articles" && !location.search.includes("categorySlug=bieu-mau")))) ||
              (item.href === "/admin/forms" && (location.pathname === "/admin/forms" || (location.pathname === "/admin/articles" && location.search.includes("categorySlug=bieu-mau")))) ||
              (item.href === "/admin/phones" && (location.pathname === "/admin/phones" || location.pathname === "/admin/leads"));
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`relative mb-1 flex items-center gap-3.5 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#edf4ff] text-[#2563eb] font-semibold before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1.5 before:rounded-r-md before:bg-[#2563eb]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-[#2563eb]"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-[#2563eb]" : "text-slate-500"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-100 px-6 py-4 text-xs font-medium text-slate-400">
          © 2026 Luật Dân Sự
        </div>
      </aside>
      <main className="lg:pl-64">
        <header className="flex h-20 items-center justify-between border-b border-slate-200/80 bg-white px-6 md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="inline-flex p-2 text-slate-600 hover:text-primary lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="text-base md:text-lg font-bold uppercase tracking-wider text-slate-800">
              Hệ thống quản lý
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <UserRound className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold text-slate-700">Admin</span>
            </div>
            <button
              onClick={logout}
              title="Đăng xuất"
              className="p-1.5 text-slate-400 transition hover:text-slate-700"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>
        <div className="p-6 md:p-8">
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
          {resources.map((item) => {
            const Icon = item.icon;
            const current = `${location.pathname}${location.search}`;
            const isActive =
              current === item.href ||
              (item.href === "/admin/posts" && (location.pathname === "/admin/posts" || (location.pathname === "/admin/articles" && !location.search.includes("categorySlug=bieu-mau")))) ||
              (item.href === "/admin/forms" && (location.pathname === "/admin/forms" || (location.pathname === "/admin/articles" && location.search.includes("categorySlug=bieu-mau")))) ||
              (item.href === "/admin/phones" && (location.pathname === "/admin/phones" || location.pathname === "/admin/leads"));
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
