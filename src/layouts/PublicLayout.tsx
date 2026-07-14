import { Search } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FloatingContact } from "../components/FloatingContact";
import { Loading } from "../components/Loading";
import { useNavigation } from "../hooks/useNavigation";
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

export function PublicLayout() {
  const navigation = useNavigation();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const site = settingValue<SiteSetting>(navigation.data?.settings, "site", fallbackSite);
  const offices = settingValue<Office[]>(navigation.data?.settings, "offices", []);
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
            <Link
              to="/"
              onClick={() => {
                if (location.pathname === "/") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="flex flex-shrink-0 items-center"
              aria-label={site.logoText}
            >
              <img src="/logo.png" alt={site.logoText} className="h-12 w-auto object-contain" />
            </Link>
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
              <form onSubmit={handleSearch} className="relative w-40 sm:w-56 lg:w-64">
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
            </div>
          </div>
          <nav className="mt-4 lg:hidden">
            <div className="-mx-2 flex items-center gap-6 overflow-x-auto px-2 py-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => {
                    if (location.pathname === item.href) {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className={({ isActive }) =>
                    `whitespace-nowrap text-[0.95rem] transition-colors ${
                      isActive
                        ? "border-b-2 border-primary font-bold text-primary"
                        : "font-medium text-slate-800"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </header>

      {navigation.isLoading ? <Loading label="Đang tải website" /> : <Outlet context={navigation.data} />}

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
