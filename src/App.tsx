import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { PublicLayout } from "./layouts/PublicLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { HomePage } from "./pages/HomePage";
import { CategoryPage } from "./pages/CategoryPage";
import { ArticlePage } from "./pages/ArticlePage";
import { SearchPage } from "./pages/SearchPage";
import { StaticPage } from "./pages/StaticPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminResourcePage } from "./pages/admin/AdminResourcePage";
import { LoginPage } from "./pages/admin/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ScrollToTop } from "./components/ScrollToTop";

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="tim-kiem" element={<SearchPage />} />
          <Route path="gioi-thieu" element={<StaticPage slug="gioi-thieu" />} />
          <Route path="lien-he" element={<StaticPage slug="lien-he" />} />
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
    </BrowserRouter>
  );
}
