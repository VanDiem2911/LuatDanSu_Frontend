import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { PublicLayout } from "./layouts/PublicLayout";
import { HomePage } from "./pages/HomePage";
import { ScrollToTop } from "./components/ScrollToTop";

const CategoryPage = lazy(() => import("./pages/CategoryPage").then(m => ({ default: m.CategoryPage })));
const ArticlePage = lazy(() => import("./pages/ArticlePage").then(m => ({ default: m.ArticlePage })));
const SearchPage = lazy(() => import("./pages/SearchPage").then(m => ({ default: m.SearchPage })));
const StaticPage = lazy(() => import("./pages/StaticPage").then(m => ({ default: m.StaticPage })));
const ContactPage = lazy(() => import("./pages/ContactPage").then(m => ({ default: m.ContactPage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })));
const AdminLayout = lazy(() => import("./layouts/AdminLayout").then(m => ({ default: m.AdminLayout })));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage").then(m => ({ default: m.AdminDashboardPage })));
const AdminResourcePage = lazy(() => import("./pages/admin/AdminResourcePage").then(m => ({ default: m.AdminResourcePage })));
const LoginPage = lazy(() => import("./pages/admin/LoginPage").then(m => ({ default: m.LoginPage })));

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={
        <div className="fixed inset-x-0 top-0 z-[120] h-1 overflow-hidden bg-primary/10">
          <span className="navigation-progress block h-full w-1/3 bg-primary" />
        </div>
      }>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="tim-kiem" element={<SearchPage />} />
            <Route path="gioi-thieu" element={<StaticPage slug="gioi-thieu" />} />
            <Route path="lien-he" element={<ContactPage />} />
            <Route path="dang-ky-tu-van" element={<ContactPage />} />
            <Route path=":categorySlug" element={<CategoryPage />} />
            <Route path=":categorySlug/:articleSlug" element={<ArticlePage />} />
          </Route>
          <Route path="admin/login" element={<LoginPage />} />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path=":resource" element={<AdminResourcePage />} />
          </Route>
          <Route path="404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
