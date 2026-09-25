import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  MapPin,
  Mail,
  Upload,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Send,
  Loader2,
  Globe,
  Phone,
  Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { listAdminResource, updateAdminResource, uploadMedia, sendTestEmail } from "../../services/cms";
import { isValidEmail, isValidPhone, VALIDATION_MESSAGES } from "../../utils/validation";

interface OfficeItem {
  title: string;
  address: string;
}

interface SiteValues {
  name: string;
  company: string;
  description: string;
  hotline: string;
  zalo: string;
  facebook: string;
  email: string;
  logoText: string;
  logoUrl: string;
}

interface SmtpValues {
  notificationEmail: string;
  notifyOnComment: boolean;
  notifyOnLead: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  fromName: string;
}

const defaultSite: SiteValues = {
  name: "Luật Dân Sự",
  company: "CÔNG TY LUẬT TNHH ANP",
  description: "Cổng thông tin pháp lý chuyên sâu về luật dân sự, đất đai, hôn nhân gia đình, thừa kế.",
  hotline: "090 360 1234",
  zalo: "https://zalo.me/0903601234",
  facebook: "https://www.facebook.com/dudisoftware/",
  email: "congtyluatanp.hcm@gmail.com",
  logoText: "Luật Dân Sự",
  logoUrl: "/logo.webp"
};

const defaultOffices: OfficeItem[] = [
  { title: "Trụ sở chính", address: "Tổ dân phố Viên 3 - Phường Cổ Nhuế 2 - Quận Bắc Từ Liêm - Hà Nội" },
  { title: "Văn phòng Hà Nội", address: "Tầng 5 Tòa N07, Trần Đăng Ninh, P. Dịch Vọng, Q. Cầu Giấy, TP. Hà Nội" },
  { title: "Văn phòng TP. HCM", address: "Tầng 1, Số 232 Nguyễn Thị Minh Khai, Phường Xuân Hoà, TP. HCM" },
  { title: "Văn phòng Đồng Nai", address: "Số 9A Nguyễn Ái Quốc, Khu phố 6, Phường Trấn Biên, TP. Biên Hòa, Tỉnh Đồng Nai" }
];

const defaultSmtp: SmtpValues = {
  notificationEmail: "congtyluatanp.hcm@gmail.com",
  notifyOnComment: true,
  notifyOnLead: true,
  smtpHost: "smtp.gmail.com",
  smtpPort: 465,
  smtpSecure: true,
  smtpUser: "",
  smtpPass: "",
  fromName: "Hệ Thống Luật Dân Sự"
};

export function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"company" | "offices" | "notifications">("company");

  const [site, setSite] = useState<SiteValues>(defaultSite);
  const [offices, setOffices] = useState<OfficeItem[]>(defaultOffices);
  const [smtp, setSmtp] = useState<SmtpValues>(defaultSmtp);

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  // Fetch settings from API
  const settingsQuery = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => listAdminResource("settings", { limit: 100 })
  });

  useEffect(() => {
    if (settingsQuery.data?.data) {
      const items = settingsQuery.data.data;
      const siteSetting = items.find((item: any) => item.key === "site");
      if (siteSetting && typeof siteSetting.value === "object") {
        setSite((prev) => ({
          ...prev,
          ...(siteSetting.value as Partial<SiteValues>),
          logoUrl: (siteSetting.value as any)?.logoUrl || prev.logoUrl || "/logo.webp"
        }));
      }

      const officesSetting = items.find((item: any) => item.key === "offices");
      if (officesSetting && Array.isArray(officesSetting.value) && officesSetting.value.length > 0) {
        setOffices(officesSetting.value as OfficeItem[]);
      }

      const smtpSetting = items.find((item: any) => item.key === "smtp");
      if (smtpSetting && typeof smtpSetting.value === "object") {
        setSmtp((prev) => ({
          ...prev,
          ...(smtpSetting.value as Partial<SmtpValues>)
        }));
      }
    }
  }, [settingsQuery.data]);

  // Handle Logo Upload
  async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      const res = await uploadMedia(file, "logo");
      if (res.url) {
        setSite((prev) => ({ ...prev, logoUrl: res.url }));
        toast.success("Tải ảnh logo lên thành công!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Tải ảnh logo thất bại, vui lòng thử lại!");
    } finally {
      setIsUploadingLogo(false);
      event.target.value = "";
    }
  }

  // Office management helpers
  function addOffice() {
    setOffices((prev) => [...prev, { title: `Văn phòng ${prev.length + 1}`, address: "" }]);
  }

  function updateOffice(index: number, field: "title" | "address", val: string) {
    setOffices((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  }

  function removeOffice(index: number) {
    if (offices.length <= 1) {
      toast.error("Cần giữ lại ít nhất 1 văn phòng!");
      return;
    }
    setOffices((prev) => prev.filter((_, i) => i !== index));
  }

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      // Validate Hotline format if provided
      if (site.hotline && !isValidPhone(site.hotline)) {
        throw new Error(`Hotline: ${VALIDATION_MESSAGES.phone}`);
      }
      // Validate Site Email format if provided
      if (site.email && !isValidEmail(site.email)) {
        throw new Error(`Email website: ${VALIDATION_MESSAGES.email}`);
      }
      // Validate Notification Email format if provided
      if (smtp.notificationEmail && !isValidEmail(smtp.notificationEmail)) {
        throw new Error(`Email nhận thông báo: ${VALIDATION_MESSAGES.email}`);
      }
      // Validate SMTP User format if provided
      if (smtp.smtpUser && !isValidEmail(smtp.smtpUser)) {
        throw new Error(`Email gửi thư SMTP: ${VALIDATION_MESSAGES.email}`);
      }

      // 1. Save site setting
      await updateAdminResource("settings", "site", {
        key: "site",
        group: "general",
        isPublic: true,
        value: site
      });

      // 2. Save offices setting
      await updateAdminResource("settings", "offices", {
        key: "offices",
        group: "contact",
        isPublic: true,
        value: offices.filter((o) => o.title.trim() || o.address.trim())
      });

      // 3. Save SMTP setting
      await updateAdminResource("settings", "smtp", {
        key: "smtp",
        group: "system",
        isPublic: false,
        value: smtp
      });
    },
    onSuccess: () => {
      toast.success("Lưu cấu hình hệ thống thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      queryClient.invalidateQueries({ queryKey: ["navigation"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Lưu cấu hình thất bại!");
    }
  });

  // Test Email
  async function handleTestEmail() {
    const target = testEmailAddress.trim() || smtp.notificationEmail.trim();
    if (!target) {
      toast.error("Vui lòng nhập email nhận thử nghiệm!");
      return;
    }
    if (!isValidEmail(target)) {
      toast.error(`Email thử nghiệm: ${VALIDATION_MESSAGES.email}`);
      return;
    }
    if (!smtp.smtpUser || !smtp.smtpPass) {
      toast.error("Vui lòng điền thông tin Email gửi và Mật khẩu ứng dụng SMTP trước khi gửi thử!");
      return;
    }
    if (!isValidEmail(smtp.smtpUser)) {
      toast.error(`Email tài khoản gửi SMTP: ${VALIDATION_MESSAGES.email}`);
      return;
    }

    try {
      setIsTestingEmail(true);
      await saveMutation.mutateAsync(); // Save first to ensure server has current credentials
      const res = await sendTestEmail(target);
      toast.success(`Đã gửi email kiểm tra thành công tới: ${res.recipient}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.message || "Gửi email thử nghiệm thất bại!");
    } finally {
      setIsTestingEmail(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="h-6 w-1 rounded-full bg-[#2563eb]" />
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wider text-slate-800">
              CẤU HÌNH HỆ THỐNG
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Chỉnh sửa thông tin công ty, logo website, địa chỉ văn phòng và cài đặt email nhận thông báo
            </p>
          </div>
        </div>

        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:opacity-50"
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{saveMutation.isPending ? "Đang lưu..." : "Lưu tất cả cấu hình"}</span>
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("company")}
          className={`flex items-center gap-2.5 px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === "company"
              ? "border-[#2563eb] text-[#2563eb] bg-white rounded-t-lg"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Thông tin công ty & Logo</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("offices")}
          className={`flex items-center gap-2.5 px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === "offices"
              ? "border-[#2563eb] text-[#2563eb] bg-white rounded-t-lg"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <MapPin className="h-4 w-4" />
          <span>Địa chỉ & Văn phòng ({offices.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2.5 px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === "notifications"
              ? "border-[#2563eb] text-[#2563eb] bg-white rounded-t-lg"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <Mail className="h-4 w-4" />
          <span>Email nhận thông báo khách hàng</span>
        </button>
      </div>

      {/* Tab 1: Thông tin công ty & Logo */}
      {activeTab === "company" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Logo Card */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="h-5 w-5 text-[#2563eb]" />
                <h3 className="text-base font-bold text-slate-800">Hình ảnh Logo</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Logo hiển thị ở đầu trang (Header), chân trang (Footer) và thanh quản trị. Định dạng hỗ trợ: PNG, WEBP, JPG, SVG.
              </p>

              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 min-h-[140px]">
                <img
                  src={site.logoUrl || "/logo.webp"}
                  alt={site.logoText}
                  className="max-h-20 max-w-full object-contain drop-shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/logo.webp";
                  }}
                />
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <label className="relative flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200">
                  {isUploadingLogo ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#2563eb]" />
                  ) : (
                    <Upload className="h-4 w-4 text-slate-600" />
                  )}
                  <span>{isUploadingLogo ? "Đang tải ảnh lên..." : "Tải ảnh logo từ máy tính"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={isUploadingLogo}
                    className="sr-only"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setSite((prev) => ({ ...prev, logoUrl: "/logo.webp" }))}
                  className="text-xs text-slate-400 hover:text-slate-600 text-center py-1 font-medium transition"
                >
                  Đặt về logo mặc định (/logo.webp)
                </button>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Hoặc nhập đường dẫn ảnh Logo (URL)
                </label>
                <input
                  type="text"
                  value={site.logoUrl}
                  onChange={(e) => setSite((prev) => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder="https://... hoặc /logo.webp"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 outline-none focus:border-[#2563eb]"
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Chữ thay thế Logo (Alt Text)
              </label>
              <input
                type="text"
                value={site.logoText}
                onChange={(e) => setSite((prev) => ({ ...prev, logoText: e.target.value }))}
                placeholder="Luật Dân Sự"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 outline-none focus:border-[#2563eb]"
              />
            </div>
          </div>

          {/* Company Info Inputs */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-[#2563eb]" />
              <h3 className="text-base font-bold text-slate-800">Thông tin pháp nhân & Liên hệ</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên website
                </label>
                <input
                  type="text"
                  value={site.name}
                  onChange={(e) => setSite((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Luật Dân Sự"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[#2563eb]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên công ty đầy đủ
                </label>
                <input
                  type="text"
                  value={site.company}
                  onChange={(e) => setSite((prev) => ({ ...prev, company: e.target.value }))}
                  placeholder="CÔNG TY LUẬT TNHH ANP"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[#2563eb]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hotline tư vấn (hiển thị trên website)
                </label>
                <input
                  type="text"
                  value={site.hotline}
                  onChange={(e) => setSite((prev) => ({ ...prev, hotline: e.target.value }))}
                  placeholder="090 360 1234"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[#2563eb]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email công ty (liên hệ công khai)
                </label>
                <input
                  type="email"
                  value={site.email}
                  onChange={(e) => setSite((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="congtyluatanp.hcm@gmail.com"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[#2563eb]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Link Zalo tư vấn
                </label>
                <input
                  type="url"
                  value={site.zalo}
                  onChange={(e) => setSite((prev) => ({ ...prev, zalo: e.target.value }))}
                  placeholder="https://zalo.me/0903601234"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[#2563eb]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Link Facebook Fanpage
                </label>
                <input
                  type="url"
                  value={site.facebook}
                  onChange={(e) => setSite((prev) => ({ ...prev, facebook: e.target.value }))}
                  placeholder="https://www.facebook.com/..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[#2563eb]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Giới thiệu ngắn / Khẩu hiệu công ty
                </label>
                <textarea
                  rows={3}
                  value={site.description}
                  onChange={(e) => setSite((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Cổng thông tin pháp lý chuyên sâu về luật dân sự, đất đai, hôn nhân gia đình..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[#2563eb]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Địa chỉ & Hệ thống Văn phòng */}
      {activeTab === "offices" && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Danh sách trụ sở & văn phòng đại diện</h3>
              <p className="text-xs text-slate-500">
                Các địa chỉ này sẽ được hiển thị ở chân trang (Footer) và trang Liên hệ của website.
              </p>
            </div>

            <button
              type="button"
              onClick={addOffice}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-xs font-bold text-[#2563eb] transition hover:bg-blue-100"
            >
              <Plus className="h-4 w-4" />
              <span>Thêm văn phòng mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offices.map((office, idx) => (
              <div
                key={idx}
                className="relative rounded-2xl border border-slate-200/80 bg-[#f8fafc] p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2563eb] text-white text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Văn phòng {idx + 1}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeOffice(idx)}
                    title="Xóa văn phòng"
                    className="p-1 text-slate-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Tên văn phòng / Trụ sở
                  </label>
                  <input
                    type="text"
                    value={office.title}
                    onChange={(e) => updateOffice(idx, "title", e.target.value)}
                    placeholder="VD: Trụ sở chính / Văn phòng Hà Nội"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-[#2563eb]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Địa chỉ chi tiết
                  </label>
                  <textarea
                    rows={2}
                    value={office.address}
                    onChange={(e) => updateOffice(idx, "address", e.target.value)}
                    placeholder="Tầng, số nhà, đường, phường, quận, tỉnh/thành phố..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-[#2563eb]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Email nhận thông báo khách hàng */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          {/* Alert Notice */}
          <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-[#edf4ff] p-5">
            <CheckCircle2 className="h-5 w-5 text-[#2563eb] flex-shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-slate-700">
              <strong className="block text-sm font-bold text-[#1e40af] mb-1">
                Tự động gửi email thông báo khi có khách hàng liên hệ
              </strong>
              Mỗi khi khách hàng để lại <strong>câu hỏi tư vấn</strong> hoặc gửi <strong>số điện thoại</strong> qua các form trên trang web, hệ thống sẽ tự động gửi email thông báo đến hòm thư quản trị được cài đặt dưới đây.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notification Recipient Card */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-[#2563eb]" />
                <h3 className="text-base font-bold text-slate-800">Email nhận thông báo</h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Địa chỉ Email nhận thông báo từ khách hàng <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={smtp.notificationEmail}
                  onChange={(e) => setSmtp((prev) => ({ ...prev, notificationEmail: e.target.value }))}
                  placeholder="VD: admin@gmail.com hoặc congtyluat@gmail.com"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#2563eb]"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Đây là email sẽ nhận thông báo khi có câu hỏi mới hoặc số điện thoại mới từ khách.
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-700">Tùy chọn sự kiện nhận thông báo:</p>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smtp.notifyOnComment}
                    onChange={(e) => setSmtp((prev) => ({ ...prev, notifyOnComment: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-[#2563eb] focus:ring-[#2563eb]"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Nhận email khi khách hàng gửi câu hỏi tư vấn mới
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smtp.notifyOnLead}
                    onChange={(e) => setSmtp((prev) => ({ ...prev, notifyOnLead: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-[#2563eb] focus:ring-[#2563eb]"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Nhận email khi khách hàng để lại số điện thoại tư vấn
                  </span>
                </label>
              </div>

              {/* Test Email Section */}
              <div className="mt-6 pt-5 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-2xl">
                <p className="text-xs font-bold text-slate-800 mb-2">Thử nghiệm gửi email:</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={testEmailAddress || smtp.notificationEmail}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    placeholder="Email nhận thử nghiệm"
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#2563eb]"
                  />
                  <button
                    type="button"
                    onClick={handleTestEmail}
                    disabled={isTestingEmail}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-900 disabled:opacity-50"
                  >
                    {isTestingEmail ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    <span>{isTestingEmail ? "Đang gửi..." : "Gửi thử"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SMTP Server Configuration */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-[#2563eb]" />
                  <h3 className="text-base font-bold text-slate-800">Cấu hình máy chủ gửi thư (SMTP)</h3>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Khuyên dùng Gmail
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Để hệ thống có thể gửi email thông báo, bạn cần cài đặt tài khoản email gửi (ví dụ: Gmail với Mật khẩu ứng dụng 16 ký tự).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Máy chủ SMTP (Host)
                  </label>
                  <input
                    type="text"
                    value={smtp.smtpHost}
                    onChange={(e) => setSmtp((prev) => ({ ...prev, smtpHost: e.target.value }))}
                    placeholder="smtp.gmail.com"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#2563eb]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cổng (Port)
                  </label>
                  <input
                    type="number"
                    value={smtp.smtpPort}
                    onChange={(e) => setSmtp((prev) => ({ ...prev, smtpPort: Number(e.target.value) }))}
                    placeholder="465"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#2563eb]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email tài khoản gửi (SMTP User)
                </label>
                <input
                  type="email"
                  value={smtp.smtpUser}
                  onChange={(e) => setSmtp((prev) => ({ ...prev, smtpUser: e.target.value }))}
                  placeholder="VD: hethong.luatdansu@gmail.com"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#2563eb]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu ứng dụng (App Password)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={smtp.smtpPass}
                    onChange={(e) => setSmtp((prev) => ({ ...prev, smtpPass: e.target.value }))}
                    placeholder="Mật khẩu 16 chữ số tạo trong Google Account"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 pr-10 text-xs text-slate-800 outline-none focus:border-[#2563eb]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Đối với Gmail: Vào Tài khoản Google &gt; Bảo mật &gt; Xác minh 2 bước &gt; Mật khẩu ứng dụng (tạo mật khẩu 16 chữ số dán vào đây).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên hiển thị người gửi (From Name)
                </label>
                <input
                  type="text"
                  value={smtp.fromName}
                  onChange={(e) => setSmtp((prev) => ({ ...prev, fromName: e.target.value }))}
                  placeholder="Hệ Thống Luật Dân Sự"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#2563eb]"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
