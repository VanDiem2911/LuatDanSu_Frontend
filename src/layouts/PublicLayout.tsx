import { Search, Menu, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FloatingContact } from "../components/FloatingContact";
import { useNavigation } from "../hooks/useNavigation";
import type { NavigationPayload } from "../types/api";
import { settingValue } from "../utils/format";

type SiteSetting = {
  name: string;
  company: string;
  hotline: string;
  email: string;
  logoText: string;
};

type Office = {
  title: string;
  address: string;
};

const fallbackSite: SiteSetting = {
  name: "Luật Dân Sự",
  company: "CÔNG TY LUẬT TNHH ANP",
  hotline: "090 360 1234",
  email: "congtyluatanp.hcm@gmail.com",
  logoText: "Luật Dân Sự"
};

const fallbackNavigation: NavigationPayload = {
  menus: [],
  settings: [],
  categories: [
    { _id: "tin-tuc", name: "Tin tức pháp luật", slug: "tin-tuc", type: "category", order: 1, isVisible: true },
    { _id: "bieu-mau", name: "Biểu mẫu pháp luật", slug: "bieu-mau", type: "category", order: 2, isVisible: true },
    { _id: "hoi-dap", name: "Hỏi đáp pháp luật", slug: "hoi-dap", type: "category", order: 3, isVisible: true },
    { _id: "ly-hon", name: "Hôn nhân & Gia đình", slug: "ly-hon", type: "specialty", order: 4, isVisible: true },
    { _id: "dat-dai", name: "Pháp luật Đất đai", slug: "dat-dai", type: "specialty", order: 5, isVisible: true },
    { _id: "thua-ke", name: "Thừa kế & Di sản", slug: "thua-ke", type: "specialty", order: 6, isVisible: true }
  ]
};

export function PublicLayout() {
  const navigation = useNavigation();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigationData = navigation.data ?? fallbackNavigation;
  const site = settingValue<SiteSetting>(navigationData.settings, "site", fallbackSite);
  const offices = settingValue<Office[]>(navigationData.settings, "offices", []);
  const menuItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Tin tức", href: "/tin-tuc" },
    { label: "Biểu mẫu", href: "/bieu-mau" },
    { label: "Hỏi đáp", href: "/hoi-dap" },
    { label: "Ly hôn", href: "/ly-hon" },
    { label: "Đất đai", href: "/dat-dai" },
    { label: "Thừa kế", href: "/thua-ke" }
  ];

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/tim-kiem?q=${encodeURIComponent(trimmed)}`);
      setQuery("");
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] selection:bg-blue-100 selection:text-blue-900">
      <header className="sticky top-0 z-[100] w-full border-b border-slate-200 bg-white py-4">
        <div className="container-page">
          <div className="flex flex-row items-center justify-between gap-4">
            <a
              href="/"
              className="flex flex-shrink-0 items-center"
              aria-label={site.logoText}
            >
              <img src="/logo.png" alt={site.logoText} className="h-12 w-auto object-contain" />
            </a>
            <div className="flex flex-row items-center gap-5">
              <nav className="hidden lg:block">
                <ul className="m-0 flex list-none items-center gap-7 p-0">
                  {menuItems.map((item) => (
                    <li key={item.href}>
                      <NavLink
                        to={item.href}
                        onClick={() => {
                          if (location.pathname === item.href) {
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }
                        }}
                        className={({ isActive }) =>
                          `whitespace-nowrap text-[0.92rem] transition-colors ${
                            isActive ? "font-bold text-[#282973]" : "font-medium text-slate-800 hover:text-primary"
                          }`
                        }
                      >
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>
              <form onSubmit={handleSearch} className="relative hidden sm:block sm:w-56 lg:w-64">
                <div className="flex items-center rounded-full bg-slate-100 px-3 py-1.5 lg:px-4">
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    type="text"
                    placeholder="Tìm kiếm..."
                    className="w-full border-none bg-transparent text-[0.85rem] text-slate-700 outline-none placeholder:text-slate-500 lg:text-[0.9rem]"
                  />
                  <button className="flex-shrink-0 rounded-full bg-primary p-1.5 text-white transition-colors hover:bg-primary-hover lg:p-2">
                    <Search className="h-4.5 w-4.5" />
                  </button>
                </div>
              </form>
              <button
                onClick={() => setMenuOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 sm:hidden transition-colors"
                aria-label="Tìm kiếm"
              >
                <Search className="h-5 w-5" />
              </button>
              <button
                onClick={() => setMenuOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 lg:hidden transition-colors"
                aria-label="Menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <div className={`fixed inset-0 z-[200] lg:hidden transition-opacity duration-300 ${menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}>
        {/* Backdrop */}
        <div onClick={() => setMenuOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-xs" />
        
        {/* Drawer Content */}
        <div className={`absolute right-0 top-0 bottom-0 w-[280px] bg-white p-6 shadow-2xl flex flex-col gap-6 transition-transform duration-300 ${menuOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Danh mục</span>
            <button
              onClick={() => setMenuOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile Search Bar inside Drawer */}
          <form onSubmit={handleSearch} className="relative w-full">
            <div className="flex items-center rounded-full bg-slate-100 px-4 py-2">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-500"
              />
              <button className="flex-shrink-0 rounded-full bg-primary p-1.5 text-white transition-colors hover:bg-primary-hover">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>
          
          <nav className="flex-1">
            <ul className="flex flex-col gap-4">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <NavLink
                    to={item.href}
                    onClick={() => {
                      setMenuOpen(false);
                      if (location.pathname === item.href) {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    className={({ isActive }) =>
                      `block py-2 text-base transition-colors ${
                        isActive ? "font-bold text-[#282973]" : "font-medium text-slate-800 hover:text-primary"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="border-t border-slate-100 pt-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Liên hệ nhanh</p>
            <a href={`tel:${site.hotline.replace(/\s/g, "")}`} className="block font-black text-lg text-primary hover:text-primary-hover">
              {site.hotline}
            </a>
            <span className="block text-sm font-medium text-slate-500 mt-1">{site.email}</span>
          </div>
        </div>
      </div>

      {navigation.isFetching ? (
        <div className="fixed left-0 right-0 top-0 z-[120] h-1 overflow-hidden bg-primary/10" aria-hidden="true">
          <span className="navigation-progress block h-full w-1/3 bg-primary" />
        </div>
      ) : null}
      <Outlet context={navigationData} />

      <footer className="border-t border-slate-200 bg-white pb-8 pt-10 text-slate-600">
        <div className="container-page">
          <div className="mb-6 text-center md:text-left">
            <h3 className="text-[1.25rem] font-extrabold uppercase tracking-tight text-navy">{site.company}</h3>
            <div className="mx-auto mt-1.5 h-1 w-16 bg-blue-600 md:mx-0" />
          </div>
          <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {offices.map((office) => (
              <div key={office.title} className="space-y-1.5">
                <h4 className="text-[0.8rem] font-bold uppercase tracking-widest text-blue-600">{office.title}</h4>
                <p className="text-[0.9rem] font-medium leading-relaxed text-slate-700">{office.address}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 lg:flex-row">
            <p className="order-2 text-[0.8rem] font-medium text-slate-400 lg:order-1">
              © 2026 {site.name} - Hỗ trợ pháp lý toàn diện.
            </p>
            <div className="order-1 flex flex-wrap items-center justify-center gap-6 lg:order-2">
              <span className="text-[0.85rem] font-bold text-slate-600">{site.email}</span>
              <a href={`tel:${site.hotline.replace(/\s/g, "")}`} className="text-[0.85rem] font-bold text-blue-600">
                {site.hotline}
              </a>
            </div>
          </div>
        </div>
      </footer>
      <FloatingContact />
    </div>
  );
}
