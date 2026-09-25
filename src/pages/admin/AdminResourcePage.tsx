import { FormEvent, useMemo, useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, Search, Trash2, X, Copy, MessageSquarePlus, FileText, Eye } from "lucide-react";
import { useParams, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { createAdminResource, deleteAdminResource, listAdminResource, updateAdminResource, uploadMedia } from "../../services/cms";
import { ErrorState } from "../../components/ErrorState";
import { Loading } from "../../components/Loading";
import { REGEX, VALIDATION_MESSAGES } from "../../utils/validation";

type FieldType = "text" | "textarea" | "richtext" | "select" | "checkbox" | "number" | "array" | "json";

type FieldConfig = {
  name: string;
  label: string;
  type?: FieldType;
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
  pattern?: RegExp;
  patternMessage?: string;
  inputMode?: "email" | "tel" | "url" | "text" | "numeric";
  required?: boolean;
  minLength?: number;
  full?: boolean;
  rows?: number;
};

const resourceLabels: Record<string, string> = {
  articles: "Bài viết",
  categories: "Danh mục",
  tags: "Tag",
  menus: "Menu",
  pages: "Trang tĩnh",
  settings: "Cấu hình",
  media: "Media",
  banners: "Banner",
  comments: "Câu hỏi",
  leads: "Thống kê SĐT",
  videos: "Videos",
  users: "Người dùng"
};

const categoryOptions = [
  { label: "Tin tức pháp luật", value: "tin-tuc" },
  { label: "Biểu mẫu pháp luật", value: "bieu-mau" },
  { label: "Hỏi đáp pháp luật", value: "hoi-dap" },
  { label: "Hôn nhân & Gia đình", value: "ly-hon" },
  { label: "Pháp luật Đất đai", value: "dat-dai" },
  { label: "Thừa kế & Di sản", value: "thua-ke" }
];

const fieldConfigs: Record<string, FieldConfig[]> = {
  articles: [
    { name: "title", label: "Tiêu đề", full: true, required: true, minLength: 3 },
    { name: "categorySlug", label: "Chuyên mục", type: "select", options: categoryOptions, required: true },
    { name: "status", label: "Trạng thái", type: "select", options: statusOptions(), required: true },
    { name: "publishedAt", label: "Ngày đăng", placeholder: "2026-05-06T15:45:31.125Z" },
    { name: "image", label: "Ảnh đại diện", full: true, pattern: REGEX.url, patternMessage: VALIDATION_MESSAGES.url, inputMode: "url" },
    { name: "fileUrl", label: "File đính kèm (URL tài liệu tải về)", full: true, placeholder: "https://res.cloudinary.com/... hoặc /files/..." },
    { name: "excerpt", label: "Mô tả ngắn", type: "textarea", rows: 3, full: true, required: true, minLength: 10 },
    { name: "content", label: "Nội dung bài viết", type: "richtext", rows: 5, full: true, required: true, minLength: 20 },
    { name: "tagSlugs", label: "Tags", type: "array", placeholder: "dan-su, thua-ke" },
    { name: "featured", label: "Bài nổi bật", type: "checkbox" },
    { name: "views", label: "Lượt xem", type: "number" }
  ],
  categories: [
    { name: "name", label: "Tên danh mục", full: true },
    { name: "slug", label: "Slug", pattern: REGEX.slug, patternMessage: VALIDATION_MESSAGES.slug },
    { name: "type", label: "Loại", type: "select", options: [{ label: "Danh mục", value: "category" }, { label: "Lĩnh vực", value: "specialty" }] },
    { name: "order", label: "Thứ tự", type: "number" },
    { name: "description", label: "Mô tả", type: "textarea", rows: 3, full: true },
    { name: "isVisible", label: "Hiển thị", type: "checkbox" }
  ],
  tags: [
    { name: "name", label: "Tên tag" },
    { name: "slug", label: "Slug", pattern: REGEX.slug, patternMessage: VALIDATION_MESSAGES.slug },
    { name: "description", label: "Mô tả", type: "textarea", rows: 3, full: true }
  ],
  menus: [
    { name: "name", label: "Tên menu" },
    { name: "location", label: "Vị trí", type: "select", options: [{ label: "Header", value: "header" }, { label: "Footer", value: "footer" }, { label: "Mobile", value: "mobile" }] },
    { name: "items", label: "Danh sách mục menu", type: "json", rows: 5, full: true },
    { name: "isActive", label: "Đang bật", type: "checkbox" }
  ],
  pages: [
    { name: "title", label: "Tiêu đề", full: true },
    { name: "slug", label: "Slug", pattern: REGEX.slug, patternMessage: VALIDATION_MESSAGES.slug },
    { name: "status", label: "Trạng thái", type: "select", options: statusOptions() },
    { name: "excerpt", label: "Mô tả ngắn", type: "textarea", rows: 3, full: true },
    { name: "content", label: "Nội dung trang", type: "richtext", rows: 5, full: true }
  ],
  settings: [
    { name: "key", label: "Khóa cấu hình" },
    { name: "group", label: "Nhóm" },
    { name: "isPublic", label: "Công khai", type: "checkbox" },
    { name: "value", label: "Giá trị cấu hình", type: "json", rows: 5, full: true }
  ],
  media: [
    { name: "filename", label: "Tên file" },
    { name: "url", label: "URL", full: true, pattern: REGEX.url, patternMessage: VALIDATION_MESSAGES.url, inputMode: "url" },
    { name: "mimeType", label: "MIME type" },
    { name: "size", label: "Dung lượng", type: "number" },
    { name: "alt", label: "Alt text", full: true },
    { name: "folder", label: "Thư mục" }
  ],
  banners: [
    { name: "title", label: "Tiêu đề", full: true },
    { name: "placement", label: "Vị trí", type: "select", options: [{ label: "Home", value: "home" }, { label: "Category", value: "category" }, { label: "Article", value: "article" }, { label: "Sidebar", value: "sidebar" }] },
    { name: "image", label: "Ảnh", full: true, pattern: REGEX.url, patternMessage: VALIDATION_MESSAGES.url, inputMode: "url" },
    { name: "href", label: "Liên kết", full: true, pattern: REGEX.url, patternMessage: VALIDATION_MESSAGES.url, inputMode: "url" },
    { name: "description", label: "Mô tả", type: "textarea", rows: 3, full: true },
    { name: "isActive", label: "Đang bật", type: "checkbox" }
  ],
  comments: [
    { name: "name", label: "Họ tên", required: true, minLength: 2 },
    { name: "email", label: "Email", pattern: REGEX.email, patternMessage: VALIDATION_MESSAGES.email, inputMode: "email", required: true },
    { name: "status", label: "Trạng thái", type: "select", options: [{ label: "Chờ duyệt", value: "pending" }, { label: "Đã duyệt", value: "approved" }, { label: "Spam", value: "spam" }] },
    { name: "content", label: "Nội dung câu hỏi", type: "textarea", rows: 6, full: true, required: true, minLength: 5 }
  ],
  leads: [
    { name: "phone", label: "Số điện thoại", pattern: REGEX.phone, patternMessage: VALIDATION_MESSAGES.phone, inputMode: "tel" },
    { name: "status", label: "Trạng thái", type: "select", options: [{ label: "Mới", value: "new" }, { label: "Đã liên hệ", value: "contacted" }, { label: "Đã đóng", value: "closed" }] },
    { name: "source", label: "Nguồn" }
  ],
  videos: [
    { name: "title", label: "Tiêu đề video", full: true },
    { name: "youtubeId", label: "Link YouTube (URL)", placeholder: "https://www.youtube.com/watch?v=..." },
    { name: "order", label: "Thứ tự", type: "number" },
    { name: "isHidden", label: "Ẩn video", type: "checkbox" }
  ],
  users: [
    { name: "name", label: "Họ tên" },
    { name: "email", label: "Email", pattern: REGEX.email, patternMessage: VALIDATION_MESSAGES.email, inputMode: "email" },
    { name: "password", label: "Mật khẩu", minLength: 8 },
    { name: "role", label: "Vai trò", type: "select", options: [{ label: "Super admin", value: "super_admin" }, { label: "Admin", value: "admin" }, { label: "Editor", value: "editor" }, { label: "Viewer", value: "viewer" }] },
    { name: "permissions", label: "Quyền", type: "array", placeholder: "articles:write, videos:write" },
    { name: "isActive", label: "Đang hoạt động", type: "checkbox" }
  ]
};

const samples: Record<string, Record<string, unknown>> = {
  articles: {
    title: "Tiêu đề bài viết",
    excerpt: "Mô tả ngắn hiển thị trên danh sách.",
    content: "Nội dung bài viết.",
    categorySlug: "tin-tuc",
    tagSlugs: ["dan-su"],
    image: "",
    status: "draft",
    featured: false,
    views: 0
  },
  categories: { name: "Tên danh mục", description: "Mô tả", type: "category", order: 10, isVisible: true },
  tags: { name: "Tên tag", description: "Mô tả" },
  menus: { name: "Menu mới", location: "header", items: [], isActive: true },
  pages: { title: "Trang mới", excerpt: "Mô tả", content: "Nội dung trang", status: "draft" },
  settings: { key: "site", value: {}, group: "general", isPublic: true },
  media: { filename: "image.jpg", url: "https://example.com/image.jpg", alt: "Mô tả ảnh", folder: "library" },
  banners: { title: "Banner mới", placement: "home", image: "https://example.com/banner.jpg", isActive: true },
  comments: { name: "Khách hàng", email: "user@example.com", content: "Nội dung câu hỏi", status: "pending" },
  leads: { phone: "0903601234", source: "admin", status: "new" },
  videos: { title: "Video tư vấn pháp luật", youtubeId: "KSpmA39TVUY", order: 10, isHidden: false },
  users: { name: "Biên tập viên", email: "editor@example.com", password: "ChangeMe123!", role: "editor", permissions: ["articles:write"], isActive: true }
};

const preferredColumns: Record<string, string[]> = {
  articles: ["title", "categorySlug", "status", "publishedAt", "views"],
  comments: ["name", "email", "content", "status", "createdAt"],
  leads: ["phone", "source", "status", "createdAt"],
  videos: ["title", "youtubeId", "order", "isHidden", "createdAt"],
  settings: ["key", "group", "isPublic", "value", "updatedAt"]
};

const settingKeyOptions = [
  { label: "Thông tin website", value: "site" },
  { label: "Danh sách văn phòng", value: "offices" }
];

const siteSettingFields: FieldConfig[] = [
  { name: "siteName", label: "Tên website" },
  { name: "siteCompany", label: "Tên công ty", full: true },
  { name: "siteDescription", label: "Mô tả", type: "textarea", rows: 3, full: true },
  { name: "siteHotline", label: "Hotline", pattern: REGEX.phone, patternMessage: VALIDATION_MESSAGES.phone, inputMode: "tel" },
  { name: "siteEmail", label: "Email", pattern: REGEX.email, patternMessage: VALIDATION_MESSAGES.email, inputMode: "email" },
  { name: "siteZalo", label: "Link Zalo", pattern: REGEX.url, patternMessage: VALIDATION_MESSAGES.url, inputMode: "url" },
  { name: "siteFacebook", label: "Link Facebook", pattern: REGEX.url, patternMessage: VALIDATION_MESSAGES.url, inputMode: "url" },
  { name: "siteLogoText", label: "Chữ logo" }
];

const officeSettingFields: FieldConfig[] = Array.from({ length: 4 }, (_, index) => [
  { name: `office${index}Title`, label: `Tên văn phòng ${index + 1}` },
  { name: `office${index}Address`, label: `Địa chỉ văn phòng ${index + 1}`, type: "textarea" as FieldType, rows: 2, full: true }
]).flat();

const categoryNameMap: Record<string, string> = {
  "thua-ke": "Thừa Kế",
  "tin-tuc": "Tin Tức",
  "dat-dai": "Đất Đai",
  "ly-hon": "Hôn Nhân",
  "hoi-dap": "Hỏi Đáp",
  "bieu-mau": "Biểu Mẫu"
};

function formatDateVN(dateVal?: unknown, withTime = false) {
  if (!dateVal) return "--/--/----";
  const date = new Date(String(dateVal));
  if (isNaN(date.getTime())) return String(dateVal);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  if (withTime) {
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  }
  return `${dd}/${mm}/${yyyy}`;
}

function statusOptions() {
  return [
    { label: "Nháp", value: "draft" },
    { label: "Đã xuất bản", value: "published" },
    { label: "Lưu trữ", value: "archived" }
  ];
}

export function AdminResourcePage() {
  const { resource: rawResource = "articles" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  let resource = rawResource;
  if (rawResource === "posts") resource = "articles";
  if (rawResource === "forms") resource = "articles";
  if (rawResource === "phones") resource = "leads";

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [page, setPage] = useState(1);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "">("");
  const [limit, setLimit] = useState(10);

  const categorySlug = (rawResource === "forms" ? "bieu-mau" : searchParams.get("categorySlug")) ?? undefined;
  const isBieuMau = categorySlug === "bieu-mau";
  const label = isBieuMau ? "Biểu mẫu" : resourceLabels[resource] ?? resource;
  const fields = useMemo(() => {
    const rawFields = fieldConfigs[resource] ?? fieldsFromSample(samples[resource] ?? {});
    if (resource === "articles") {
      return rawFields.map((field) => {
        if (field.name === "categorySlug") {
          return {
            ...field,
            options: categorySlug === "bieu-mau"
              ? [{ label: "Biểu mẫu pháp luật", value: "bieu-mau" }]
              : categoryOptions.filter((opt) => opt.value !== "bieu-mau")
          };
        }
        return field;
      });
    }
    return rawFields;
  }, [resource, categorySlug]);

  const modalFields = resource === "settings" ? settingFieldsFor(formValues) : fields;

  useEffect(() => {
    setFilterCategory("");
    setFilterDate("");
    setSortField("");
    setSortOrder("");
  }, [resource]);

  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "reply" && resource === "articles") {
      const replyTitle = searchParams.get("title") ?? "";
      const replyAuthor = searchParams.get("author") ?? "";
      
      const defaults = Object.fromEntries(
        fields.map((field) => [field.name, defaultValueFor(field)])
      );
      
      defaults.title = `Hỏi đáp: ${replyTitle.slice(0, 50)}${replyTitle.length > 50 ? "..." : ""}`;
      defaults.categorySlug = "hoi-dap";
      defaults.tagSlugs = "hoi-dap";
      defaults.excerpt = replyTitle;
      defaults.content = `Câu hỏi từ ${replyAuthor || "Khách hàng"}:\n"${replyTitle}"\n\nLuật sư trả lời:`;
      
      setEditing({});
      setFormValues(hydrateForm(fields, defaults));
      
      navigate(location.pathname, { replace: true });
    }
  }, [searchParams, resource, fields, navigate, location.pathname]);

  const query = useQuery({
    queryKey: ["admin-resource", resource, categorySlug, search, page, filterCategory, filterDate, sortField, sortOrder, limit],
    queryFn: () =>
      listAdminResource(resource, {
        search,
        page,
        limit,
        categorySlug: filterCategory || categorySlug,
        date: filterDate || undefined,
        sort: sortField || undefined,
        order: sortOrder || undefined
      })
  });

  function handleSort(field: string) {
    if (sortField !== field) {
      setSortField(field);
      setSortOrder("asc");
    } else if (sortOrder === "asc") {
      setSortOrder("desc");
    } else if (sortOrder === "desc") {
      setSortField("");
      setSortOrder("");
    }
    setPage(1);
  }

  const columns = useMemo(() => {
    const preferred = preferredColumns[resource];
    if (preferred) return preferred;
    const first = query.data?.data[0];
    if (!first) return ["_id", "title", "name", "slug", "status", "createdAt"];
    return Object.keys(first).filter((key) => !["content", "passwordHash", "__v"].includes(key)).slice(0, 6);
  }, [query.data?.data, resource]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const parsed = resource === "settings" ? serializeSettingsForm(formValues) : serializeForm(resource, fields, formValues);
      if (editing?._id) {
        return updateAdminResource(resource, String(editing._id), parsed);
      }
      if (resource === "users") {
        return createAdminResource("users/invite", parsed);
      }
      return createAdminResource(resource, parsed);
    },
    onSuccess: () => {
      toast.success("Đã lưu dữ liệu");
      setEditing(null);
      setFormValues({});
      queryClient.invalidateQueries({ queryKey: ["admin-resource", resource] });
      queryClient.invalidateQueries({ queryKey: ["admin-count", resource] });
    },
    onError: (err: any) => {
      const serverMessage = err.response?.data?.error;
      const details = err.response?.data?.details;
      
      if (serverMessage === "Validation failed" && details?.fieldErrors) {
        const messages = Object.entries(details.fieldErrors)
          .map(([field, errors]) => {
            const fieldLabel = fields.find((f) => f.name === field)?.label || field;
            let errorMsg = Array.isArray(errors) ? errors[0] : String(errors);
            
            if (errorMsg.includes("must contain at least")) {
              const minMatch = errorMsg.match(/at least (\d+)/);
              const min = minMatch ? minMatch[1] : "";
              errorMsg = `phải có ít nhất ${min} ký tự.`;
            } else if (errorMsg.includes("Required")) {
              errorMsg = "không được để trống.";
            } else if (errorMsg.includes("Invalid url")) {
              errorMsg = "không đúng định dạng URL.";
            } else if (errorMsg.includes("Invalid email")) {
              errorMsg = "không đúng định dạng email.";
            }
            
            return `• ${fieldLabel}: ${errorMsg}`;
          })
          .join("\n");
        toast.error(`Lưu thất bại. Vui lòng kiểm tra lại:\n${messages}`);
      } else if (serverMessage) {
        toast.error(`Lỗi: ${serverMessage}`);
      } else {
        toast.error("Không lưu được dữ liệu. Kiểm tra thông tin trong form.");
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminResource(resource, id),
    onSuccess: () => {
      toast.success("Đã xóa");
      queryClient.invalidateQueries({ queryKey: ["admin-resource", resource] });
      queryClient.invalidateQueries({ queryKey: ["admin-count", resource] });
    },
    onError: () => toast.error("Không xóa được bản ghi")
  });

  function handleDelete(id: string) {
    if (window.confirm("Bạn có chắc chắn muốn xóa bản ghi này không?")) {
      deleteMutation.mutate(id);
    }
  }

  function openCreate() {
    const defaults = Object.fromEntries(
      fields.map((field) => [field.name, defaultValueFor(field)])
    );
    if (categorySlug) {
      defaults.categorySlug = categorySlug;
    }
    setEditing({});
    setFormValues(resource === "settings" ? hydrateSettingsForm(defaults) : hydrateForm(fields, defaults));
  }

  function openEdit(row: Record<string, unknown>) {
    const clean = Object.fromEntries(Object.entries(row).filter(([key]) => !["_id", "createdAt", "updatedAt", "__v"].includes(key)));
    setEditing(row);
    setFormValues(resource === "settings" ? hydrateSettingsForm(clean) : hydrateForm(fields, clean));
  }

  function updateField(name: string, value: unknown) {
    setFormValues((current) => {
      if (resource === "settings" && name === "key") {
        return {
          ...current,
          key: value,
          group: value === "offices" ? "contact" : "general"
        };
      }
      return { ...current, [name]: value };
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateFormValues(modalFields, formValues);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    saveMutation.mutate();
  }

  async function handleToggleLeadStatus(row: Record<string, unknown>) {
    const currentStatus = String(row.status ?? "new");
    const newStatus = currentStatus === "contacted" ? "new" : "contacted";
    try {
      await updateAdminResource("leads", String(row._id), { status: newStatus });
      toast.success(newStatus === "contacted" ? "Đã chuyển sang Đã gọi" : "Đã chuyển sang Chưa gọi");
      queryClient.invalidateQueries({ queryKey: ["admin-resource", resource] });
    } catch {
      toast.error("Không thể cập nhật trạng thái");
    }
  }

  let pageTitle = "QUẢN LÝ DỮ LIỆU";
  let addButtonText = "Thêm mới";
  let searchPlaceholder = "Tìm kiếm...";
  let hasAddButton = true;

  if (isBieuMau) {
    pageTitle = "QUẢN LÝ BIỂU MẪU";
    addButtonText = "Thêm biểu mẫu";
    searchPlaceholder = "Tìm kiếm biểu mẫu...";
  } else if (resource === "articles") {
    pageTitle = "QUẢN LÝ BÀI VIẾT";
    addButtonText = "Thêm bài mới";
    searchPlaceholder = "Tìm kiếm bài viết...";
  } else if (resource === "videos") {
    pageTitle = "QUẢN LÝ VIDEO";
    addButtonText = "Thêm Video";
    searchPlaceholder = "Tìm kiếm video...";
  } else if (resource === "leads") {
    pageTitle = "THỐNG KÊ SĐT";
    hasAddButton = false;
    searchPlaceholder = "Tìm kiếm số điện thoại hoặc tên...";
  } else if (resource === "comments") {
    pageTitle = "QUẢN LÝ CÂU HỎI";
    hasAddButton = false;
    searchPlaceholder = "Tìm kiếm câu hỏi...";
  } else if (resource === "categories") {
    pageTitle = "QUẢN LÝ CHUYÊN MỤC";
    addButtonText = "Thêm chuyên mục";
    searchPlaceholder = "Tìm kiếm chuyên mục...";
  }

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="h-6 w-1 rounded-full bg-[#2563eb]" />
          <h1 className="text-xl font-bold uppercase tracking-wider text-slate-800">
            {pageTitle}
          </h1>
        </div>

        {hasAddButton && (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>{addButtonText}</span>
          </button>
        )}
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        {/* Search Bar */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#2563eb] placeholder:text-slate-400 shadow-sm"
          />
        </div>

        {/* Content Table */}
        <div className="overflow-x-auto">
          {query.isLoading ? (
            <Loading variant="table" />
          ) : query.isError ? (
            <ErrorState />
          ) : isBieuMau ? (
            /* Biểu mẫu Table (Ảnh 3) */
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="pb-4 pr-4">Biểu mẫu</th>
                  <th className="pb-4 px-4 whitespace-nowrap">Ngày đăng</th>
                  <th className="pb-4 px-4 whitespace-nowrap">Trạng thái</th>
                  <th className="pb-4 pl-4 text-right whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {query.data?.data.map((row: any) => {
                  const dateStr = formatDateVN(row.publishedAt || row.createdAt);
                  const publicUrl = `/${row.categorySlug || "bieu-mau"}/${row.slug || row._id}`;

                  return (
                    <tr key={String(row._id)} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3.5">
                          <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-amber-50 border border-amber-200/60 text-amber-700 flex-shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>
                          <span className="font-bold text-slate-800 line-clamp-2 max-w-lg">
                            {row.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-block rounded-full bg-[#ecfdf5] px-2.5 py-0.5 text-xs font-semibold text-[#059669]">
                          Hiển thị
                        </span>
                      </td>
                      <td className="py-4 pl-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-2">
                          <a
                            href={publicUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-emerald-500 hover:text-emerald-600 transition"
                            title="Xem biểu mẫu trên web"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => openEdit(row)}
                            className="p-1.5 text-[#2563eb] hover:text-blue-700 transition"
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(String(row._id))}
                            className="p-1.5 text-[#ef4444] hover:text-red-700 transition"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : resource === "articles" ? (
            /* Bài viết Table (Ảnh 1) */
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="pb-4 pr-4">Tiêu đề</th>
                  <th className="pb-4 px-4 whitespace-nowrap">Chuyên mục</th>
                  <th className="pb-4 px-4 whitespace-nowrap">Lượt xem</th>
                  <th className="pb-4 px-4 whitespace-nowrap">Ngày đăng</th>
                  <th className="pb-4 pl-4 text-right whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {query.data?.data.map((row: any) => {
                  const catName = categoryNameMap[row.categorySlug] || row.categorySlug || "Thừa Kế";
                  const dateStr = formatDateVN(row.publishedAt || row.createdAt);
                  const publicUrl = `/${row.categorySlug || "tin-tuc"}/${row.slug || row._id}`;

                  return (
                    <tr key={String(row._id)} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={row.image || "/logo.webp"}
                            alt=""
                            className="h-10 w-14 rounded-md object-cover bg-slate-100 flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/logo.webp";
                            }}
                          />
                          <span className="font-bold text-slate-800 line-clamp-2 max-w-md">
                            {row.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {catName}
                      </td>
                      <td className="py-4 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {row.views ?? 0}
                      </td>
                      <td className="py-4 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-4 pl-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-2">
                          <a
                            href={publicUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-emerald-500 hover:text-emerald-600 transition"
                            title="Xem bài viết trên web"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => openEdit(row)}
                            className="p-1.5 text-[#2563eb] hover:text-blue-700 transition"
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(String(row._id))}
                            className="p-1.5 text-[#ef4444] hover:text-red-700 transition"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : resource === "leads" ? (
            /* Thống kê SĐT Table (Ảnh 4) */
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="pb-4 pr-4 w-16 whitespace-nowrap">STT</th>
                  <th className="pb-4 px-4 whitespace-nowrap">Số điện thoại</th>
                  <th className="pb-4 px-4 whitespace-nowrap">Ngày gửi</th>
                  <th className="pb-4 px-4 whitespace-nowrap">Trạng thái</th>
                  <th className="pb-4 pl-4 text-right whitespace-nowrap">Đánh dấu xử lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {query.data?.data.map((row: any, idx: number) => {
                  const stt = (page - 1) * limit + idx + 1;
                  const isContacted = row.status === "contacted";
                  const dateStr = formatDateVN(row.createdAt, true);

                  return (
                    <tr key={String(row._id)} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 pr-4 font-bold text-slate-700">
                        {stt}
                      </td>
                      <td className="py-4 px-4 font-bold text-[#2563eb] tracking-wide">
                        {row.phone}
                      </td>
                      <td className="py-4 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                            isContacted
                              ? "bg-[#f0fdf4] text-[#16a34a]"
                              : "bg-[#fff7ed] text-[#ea580c]"
                          }`}
                        >
                          {isContacted ? "Đã gọi" : "Chưa gọi"}
                        </span>
                      </td>
                      <td className="py-4 pl-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleToggleLeadStatus(row)}
                          className="rounded-lg bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 transition active:scale-95 shadow-sm"
                        >
                          Đổi trạng thái
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : resource === "videos" ? (
            /* Videos Table (Ảnh 5) */
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="pb-4 pr-4">Video tư vấn</th>
                  <th className="pb-4 px-4 whitespace-nowrap">Trạng thái</th>
                  <th className="pb-4 pl-4 text-right whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {query.data?.data.map((row: any) => {
                  const thumb = `https://img.youtube.com/vi/${row.youtubeId}/hqdefault.jpg`;
                  const ytUrl = `https://www.youtube.com/watch?v=${row.youtubeId}`;
                  const isHidden = Boolean(row.isHidden);

                  return (
                    <tr key={String(row._id)} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={thumb}
                            alt=""
                            className="h-10 w-16 rounded-md object-cover bg-slate-100 flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/logo.webp";
                            }}
                          />
                          <div>
                            <p className="font-bold text-slate-800 line-clamp-2 max-w-lg">
                              {row.title}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              ID: {row.youtubeId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`text-xs font-bold uppercase ${
                            !isHidden ? "text-emerald-500" : "text-slate-400"
                          }`}
                        >
                          {!isHidden ? "HIỂN THỊ" : "ẨN"}
                        </span>
                      </td>
                      <td className="py-4 pl-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-2">
                          <a
                            href={ytUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-emerald-500 hover:text-emerald-600 transition"
                            title="Xem video trên YouTube"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => openEdit(row)}
                            className="p-1.5 text-[#2563eb] hover:text-blue-700 transition"
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(String(row._id))}
                            className="p-1.5 text-[#ef4444] hover:text-red-700 transition"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : resource === "comments" ? (
            /* Câu hỏi Table */
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="pb-4 pr-4">Người hỏi & Nội dung</th>
                  <th className="pb-4 px-4 whitespace-nowrap">Ngày gửi</th>
                  <th className="pb-4 px-4 whitespace-nowrap">Trạng thái</th>
                  <th className="pb-4 pl-4 text-right whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {query.data?.data.map((row: any) => {
                  const isPending = row.status === "pending";
                  const dateStr = formatDateVN(row.createdAt, true);

                  return (
                    <tr key={String(row._id)} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 pr-4">
                        <p className="font-bold text-slate-800">
                          {row.name} <span className="font-normal text-xs text-slate-400">({row.email})</span>
                        </p>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 max-w-lg">
                          {row.content}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            isPending
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {isPending ? "Chờ duyệt" : "Đã duyệt"}
                        </span>
                      </td>
                      <td className="py-4 pl-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              navigate(
                                `/admin/articles?action=reply&title=${encodeURIComponent(
                                  String(row.content ?? "")
                                )}&author=${encodeURIComponent(String(row.name ?? ""))}`
                              );
                            }}
                            className="inline-flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
                            title="Tạo bài viết trả lời câu hỏi này"
                          >
                            <MessageSquarePlus className="h-3.5 w-3.5" />
                            <span>Trả lời</span>
                          </button>
                          <button
                            onClick={() => openEdit(row)}
                            className="p-1.5 text-[#2563eb] hover:text-blue-700 transition"
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(String(row._id))}
                            className="p-1.5 text-[#ef4444] hover:text-red-700 transition"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            /* Generic Fallback Table */
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                  {columns.map((column) => (
                    <th key={column} className="pb-4 px-4">
                      {columnTranslations[column] || column}
                    </th>
                  ))}
                  <th className="pb-4 pl-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {query.data?.data.map((row) => (
                  <tr key={String(row._id)} className="hover:bg-slate-50/80 transition-colors">
                    {columns.map((column) => (
                      <td key={column} className="max-w-xs truncate py-4 px-4 font-medium text-slate-700">
                        {renderCell(row, column)}
                      </td>
                    ))}
                    <td className="py-4 pl-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(row)}
                          className="p-1.5 text-[#2563eb] hover:text-blue-700 transition"
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(String(row._id))}
                          className="p-1.5 text-[#ef4444] hover:text-red-700 transition"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
          <span>
            Hiển thị {query.data?.data.length ?? 0} trên tổng số {query.data?.meta.total ?? 0} bản ghi
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((v) => Math.max(v - 1, 1))}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-sm transition"
            >
              Trước
            </button>
            <span className="px-2 font-bold text-slate-700">
              {page} / {query.data?.meta.totalPages || 1}
            </span>
            <button
              disabled={page >= (query.data?.meta.totalPages ?? 1)}
              onClick={() => setPage((v) => v + 1)}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-sm transition"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {editing ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/50 p-4">
          <form onSubmit={submit} className="flex max-h-[86vh] w-full max-w-2xl flex-col bg-white shadow-soft">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-black text-ink">{editing._id ? "Cập nhật" : "Tạo mới"} {label}</h2>
              <button type="button" onClick={() => setEditing(null)} className="p-2 text-slate-500 hover:text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-3 overflow-y-auto px-5 py-4 md:grid-cols-2">
              {modalFields.map((field) => (
                <FieldInput
                  key={field.name}
                  field={field}
                  value={formValues[field.name]}
                  onChange={(value) => updateField(field.name, value)}
                />
              ))}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
              <button type="button" onClick={() => setEditing(null)} className="border border-slate-200 px-4 py-2 font-bold">
                Hủy
              </button>
              <button disabled={saveMutation.isPending} className="bg-primary px-5 py-2 font-bold text-white disabled:opacity-60">
                Lưu
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function settingFieldsFor(values: Record<string, unknown>): FieldConfig[] {
  const baseFields: FieldConfig[] = [
    { name: "key", label: "Loại cấu hình", type: "select", options: settingKeyOptions },
    { name: "group", label: "Nhóm" },
    { name: "isPublic", label: "Công khai", type: "checkbox", full: true }
  ];
  const key = String(values.key ?? "site");
  if (key === "offices") return [...baseFields, ...officeSettingFields];
  return [...baseFields, ...siteSettingFields];
}

function hydrateSettingsForm(data: Record<string, unknown>) {
  const key = String(data.key ?? "site");
  const base = {
    key,
    group: data.group ?? (key === "offices" ? "contact" : "general"),
    isPublic: data.isPublic ?? true
  };

  if (key === "offices") {
    const offices = Array.isArray(data.value) ? data.value : [];
    return {
      ...base,
      ...Object.fromEntries(
        Array.from({ length: 4 }, (_, index) => {
          const office = asRecord(offices[index]);
          return [
            [`office${index}Title`, String(office.title ?? "")],
            [`office${index}Address`, String(office.address ?? "")]
          ];
        }).flat()
      )
    };
  }

  const site = asRecord(data.value);
  return {
    ...base,
    siteName: String(site.name ?? ""),
    siteCompany: String(site.company ?? ""),
    siteDescription: String(site.description ?? ""),
    siteHotline: String(site.hotline ?? ""),
    siteEmail: String(site.email ?? ""),
    siteZalo: String(site.zalo ?? ""),
    siteFacebook: String(site.facebook ?? ""),
    siteLogoText: String(site.logoText ?? "")
  };
}

function serializeSettingsForm(values: Record<string, unknown>) {
  const key = String(values.key ?? "site");
  const base = {
    key,
    group: String(values.group ?? (key === "offices" ? "contact" : "general")),
    isPublic: Boolean(values.isPublic)
  };

  if (key === "offices") {
    return {
      ...base,
      value: Array.from({ length: 4 }, (_, index) => ({
        title: String(values[`office${index}Title`] ?? "").trim(),
        address: String(values[`office${index}Address`] ?? "").trim()
      })).filter((office) => office.title || office.address)
    };
  }

  return {
    ...base,
    value: {
      name: String(values.siteName ?? "").trim(),
      company: String(values.siteCompany ?? "").trim(),
      description: String(values.siteDescription ?? "").trim(),
      hotline: String(values.siteHotline ?? "").trim(),
      email: String(values.siteEmail ?? "").trim(),
      zalo: String(values.siteZalo ?? "").trim(),
      facebook: String(values.siteFacebook ?? "").trim(),
      logoText: String(values.siteLogoText ?? "").trim()
    }
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function FieldInput({
  field,
  value,
  onChange
}: {
  field: FieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const type = field.type ?? "text";
  const wrapperClass = field.full || ["textarea", "json"].includes(type) ? "md:col-span-2" : "";

  const tagsQuery = useQuery({
    queryKey: ["admin-tags"],
    queryFn: () => listAdminResource("tags", { limit: 100 }),
    enabled: type === "array" && field.name === "tagSlugs"
  });

  if (field.name === "fileUrl") {
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        setUploading(true);
        const res = await uploadMedia(file, "library");
        onChange(res.url);
        toast.success("Tải tài liệu lên Cloudinary thành công!");
      } catch (err) {
        console.error("Upload error:", err);
        toast.error("Không thể tải tài liệu lên!");
      } finally {
        setUploading(false);
      }
    };

    return (
      <div className={`block ${wrapperClass}`}>
        <span className="mb-1.5 block text-sm font-bold text-slate-700">{field.label}</span>
        <div className="flex flex-col gap-2 rounded border border-slate-200 bg-slate-50 p-3">
          {value ? (
            <div className="text-xs text-blue-600 font-semibold truncate bg-white border border-slate-200 rounded px-3 py-2 flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              <span className="truncate">{String(value)}</span>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">Chưa chọn tài liệu đính kèm</div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={String(value ?? "")}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Nhập đường dẫn tài liệu (URL) hoặc tải file từ máy..."
              className="flex-1 border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-primary"
            />
            <label className="cursor-pointer bg-primary hover:bg-primary-hover text-white font-bold text-xs flex items-center justify-center px-4 py-2 rounded shadow-sm whitespace-nowrap">
              {uploading ? "Đang tải..." : "Tải tài liệu lên"}
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    );
  }

  if (field.name === "image") {
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        setUploading(true);
        const res = await uploadMedia(file, "library");
        onChange(res.url);
        toast.success("Tải ảnh lên Cloudinary thành công!");
      } catch (err) {
        console.error("Upload error:", err);
        toast.error("Không thể tải ảnh lên!");
      } finally {
        setUploading(false);
      }
    };

    return (
      <div className={`block ${wrapperClass}`}>
        <span className="mb-1.5 block text-sm font-bold text-slate-700">{field.label}</span>
        <div className="flex flex-col gap-2 rounded border border-slate-200 bg-slate-50 p-3">
          {value ? (
            <div className="relative h-20 w-36 overflow-hidden border border-slate-200 bg-white rounded">
              <img src={String(value)} alt="Preview" className="h-full w-full object-contain p-1" />
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">Chưa chọn ảnh</div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={String(value ?? "")}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Nhập đường dẫn ảnh (URL) hoặc tải file từ máy..."
              className="flex-1 border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-primary"
            />
            <label className="cursor-pointer bg-primary hover:bg-primary-hover text-white font-bold text-xs flex items-center justify-center px-4 py-2 rounded shadow-sm">
              {uploading ? "Đang tải..." : "Tải ảnh lên"}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    );
  }

  if (type === "checkbox") {
    return (
      <label className={`flex items-center gap-3 border border-slate-200 bg-slate-50 px-3 py-2.5 ${wrapperClass}`}>
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          required={field.required}
          className="h-4 w-4 accent-primary"
        />
        <span className="text-sm font-bold text-slate-700">{field.label}</span>
      </label>
    );
  }

  if (type === "array" && field.name === "tagSlugs") {
    const selectedSlugs = String(value ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const availableTags = tagsQuery.data?.data || [];

    return (
      <div className={`relative ${wrapperClass}`}>
        <span className="mb-1.5 block text-sm font-bold text-slate-700">{field.label}</span>
        <div className="border border-slate-200 bg-white rounded">
          <div className="max-h-40 overflow-y-auto p-2 space-y-1.5">
            {tagsQuery.isLoading ? (
              <span className="text-xs text-slate-400">Đang tải danh sách tag...</span>
            ) : availableTags.length === 0 ? (
              <span className="text-xs text-slate-400">Không có tag nào.</span>
            ) : (
              availableTags.map((tag: any) => {
                const checked = selectedSlugs.includes(tag.slug);
                return (
                  <label key={tag._id} className="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const nextSlugs = checked
                          ? selectedSlugs.filter((s) => s !== tag.slug)
                          : [...selectedSlugs, tag.slug];
                        onChange(nextSlugs.join(", "));
                      }}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="text-sm font-medium text-slate-700">{tag.name} ({tag.slug})</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <label className={`block ${wrapperClass}`}>
      <span className="mb-1.5 block text-sm font-bold text-slate-700">{field.label}</span>
      {type === "select" ? (
        <select
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          required={field.required}
          className="w-full border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="">Chọn...</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      ) : type === "textarea" || type === "richtext" || type === "json" ? (
        <textarea
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          rows={Math.min(field.rows ?? 3, 5)}
          placeholder={field.placeholder}
          required={field.required}
          minLength={field.minLength}
          className="w-full border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
        />
      ) : (
        <input
          type={type === "number" ? "number" : "text"}
          value={String(value ?? "")}
          onChange={(event) => onChange(type === "number" ? event.target.value : event.target.value)}
          placeholder={field.placeholder}
          pattern={field.pattern?.source}
          title={field.patternMessage}
          inputMode={field.inputMode}
          required={field.required}
          minLength={field.minLength}
          disabled={field.name === "publishedAt"}
          className="w-full border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
        />
      )}
      {type === "array" ? <span className="mt-1 block text-xs font-medium text-slate-400">Nhập nhiều giá trị, cách nhau bằng dấu phẩy.</span> : null}
      {type === "json" ? <span className="mt-1 block text-xs font-medium text-slate-400">Field này là cấu hình động, nhập JSON hợp lệ.</span> : null}
      {type === "richtext" ? <span className="mt-1 block text-xs font-medium text-slate-400">Nhập nội dung thường, hệ thống tự định dạng khi lưu.</span> : null}
    </label>
  );
}

function hydrateForm(fields: FieldConfig[], data: Record<string, unknown>) {
  return Object.fromEntries(
    fields.map((field) => {
      const value = data[field.name];
      if (field.name === "publishedAt" && value) {
        return [field.name, toGmt7ISOString(new Date(String(value)))];
      }
      if (field.type === "array") return [field.name, Array.isArray(value) ? value.join(", ") : value ?? ""];
      if (field.type === "json") return [field.name, JSON.stringify(value ?? defaultValueFor(field), null, 2)];
      if (field.type === "richtext") return [field.name, stripHtml(String(value ?? ""))];
      if (field.type === "checkbox") return [field.name, Boolean(value)];
      return [field.name, value ?? defaultValueFor(field)];
    })
  );
}

function extractYoutubeId(urlOrId: string): string {
  if (!urlOrId) return "";
  const trimmed = urlOrId.trim();
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);
  if (match && match[2].length === 11) {
    return match[2];
  }
  return trimmed;
}

function serializeForm(resource: string, fields: FieldConfig[], values: Record<string, unknown>) {
  const entries = fields.map((field) => {
    const value = values[field.name];
    if (resource === "articles" && field.name === "image") {
      return [field.name, value === "" || value == null ? "/logo.png" : value];
    }
    if (field.name === "youtubeId") {
      return [field.name, extractYoutubeId(String(value ?? ""))];
    }
    if (field.type === "number") {
      return [field.name, value === "" || value == null ? undefined : Number(value)];
    }
    if (field.type === "checkbox") {
      return [field.name, Boolean(value)];
    }
    if (field.type === "array") {
      return [
        field.name,
        String(value ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      ];
    }
    if (field.type === "json") {
      return [field.name, value ? JSON.parse(String(value)) : defaultValueFor(field)];
    }
    if (field.type === "richtext") {
      return [field.name, toHtmlParagraphs(String(value ?? ""))];
    }
    return [field.name, value === "" ? undefined : value];
  });

  return Object.fromEntries(entries.filter(([, value]) => value !== undefined));
}

function validateFormValues(fields: FieldConfig[], values: Record<string, unknown>) {
  for (const field of fields) {
    if (field.type === "checkbox") continue;
    const rawValue = values[field.name];
    const value = String(rawValue ?? "").trim();

    if (field.required && !value) {
      return `Vui lòng nhập ${field.label}.`;
    }

    if (!value) continue;

    if (field.minLength && value.length < field.minLength) {
      return `${field.label} phải có ít nhất ${field.minLength} ký tự.`;
    }

    if (field.pattern) {
      const isUrlPattern = field.pattern.toString() === REGEX.url.toString();
      const isRelativeUrl = isUrlPattern && value.startsWith("/");
      if (!isRelativeUrl && !field.pattern.test(value)) {
        return field.patternMessage ?? `${field.label} không đúng định dạng.`;
      }
    }
  }

  return "";
}

function toGmt7ISOString(date: Date) {
  const pad = (num: number) => String(num).padStart(2, '0');
  const padMs = (num: number) => String(num).padStart(3, '0');
  const gmt7Date = new Date(date.getTime() + 7 * 3600000);
  const yyyy = gmt7Date.getUTCFullYear();
  const mm = pad(gmt7Date.getUTCMonth() + 1);
  const dd = pad(gmt7Date.getUTCDate());
  const hh = pad(gmt7Date.getUTCHours());
  const min = pad(gmt7Date.getUTCMinutes());
  const ss = pad(gmt7Date.getUTCSeconds());
  const ms = padMs(gmt7Date.getUTCMilliseconds());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}.${ms}+07:00`;
}

function formatAdminDate(value: unknown) {
  if (!value) return "";
  const date = new Date(String(value));
  if (isNaN(date.getTime())) return String(value);
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())} ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function defaultValueFor(field: FieldConfig) {
  if (field.name === "publishedAt") return toGmt7ISOString(new Date());
  if (field.name === "order") return 1;
  if (field.name === "status") return "published";
  if (field.type === "checkbox") return false;
  if (field.type === "number") return 0;
  if (field.type === "array") return "";
  if (field.type === "json") return {};
  return "";
}

function fieldsFromSample(sample: Record<string, unknown>): FieldConfig[] {
  return Object.keys(sample).map((name) => ({ name, label: name }));
}

function stripHtml(value: string) {
  return value
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function toHtmlParagraphs(value: string) {
  const paragraphs = value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (!paragraphs.length) return "<p></p>";
  return paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`).join("");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const columnTranslations: Record<string, string> = {
  _id: "ID",
  title: "Tiêu đề",
  name: "Tên",
  slug: "Đường dẫn (Slug)",
  status: "Trạng thái",
  createdAt: "Ngày tạo",
  updatedAt: "Ngày cập nhật",
  publishedAt: "Ngày đăng",
  categorySlug: "Chuyên mục",
  views: "Lượt xem",
  phone: "Số điện thoại",
  source: "Nguồn",
  youtubeId: "Link YouTube",
  order: "Thứ tự",
  isHidden: "Ẩn",
  key: "Khóa cấu hình",
  group: "Nhóm",
  isPublic: "Công khai",
  value: "Giá trị",
  email: "Email",
  content: "Nội dung",
  role: "Vai trò",
  filename: "Tên file",
  url: "Đường dẫn (URL)",
  mimeType: "Định dạng (MIME)",
  size: "Dung lượng",
  alt: "Mô tả ảnh (Alt)",
  folder: "Thư mục",
  type: "Loại",
  isVisible: "Hiển thị",
  location: "Vị trí",
  items: "Danh mục menu",
  isActive: "Đang bật",
  placement: "Vị trí đặt",
  href: "Liên kết (URL)",
  permissions: "Quyền"
};

const valueTranslations: Record<string, string> = {
  true: "Có",
  false: "Không",
  draft: "Nháp",
  published: "Đã xuất bản",
  archived: "Lưu trữ",
  new: "Mới",
  contacted: "Đã liên hệ",
  closed: "Đã đóng",
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  spam: "Spam",
  "tin-tuc": "Tin tức",
  "bieu-mau": "Biểu mẫu",
  "hoi-dap": "Hỏi đáp",
  "ly-hon": "Ly hôn",
  "dat-dai": "Đất đai",
  "thua-ke": "Thừa kế",
  super_admin: "Super admin",
  admin: "Admin",
  editor: "Biên tập viên",
  viewer: "Người xem"
};

function renderValue(value: unknown) {
  if (value == null) return "";
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "boolean") return value ? "Có" : "Không";
  const str = String(value);
  return valueTranslations[str] || str;
}

function renderCell(row: Record<string, unknown>, column: string) {
  if (column === "value" && "key" in row) {
    return renderSettingSummary(String(row.key ?? ""), row.value);
  }
  if (["createdAt", "updatedAt", "publishedAt"].includes(column)) {
    return formatAdminDate(row[column]);
  }
  if (column === "phone") {
    const phone = String(row[column] ?? "");
    return (
      <span
        onClick={() => {
          navigator.clipboard.writeText(phone);
          toast.success("Đã sao chép số điện thoại!");
        }}
        className="cursor-pointer font-bold text-primary hover:underline inline-flex items-center gap-1.5"
        title="Bấm để sao chép số điện thoại"
      >
        {phone}
        <Copy className="h-3 w-3 text-slate-400" />
      </span>
    );
  }
  if (column === "youtubeId") {
    const id = String(row[column] ?? "");
    if (!id) return "";
    return (
      <a
        href={`https://www.youtube.com/watch?v=${id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline font-semibold"
        title="Nhấp để xem video trên YouTube"
      >
        https://youtube.com/watch?v={id}
      </a>
    );
  }
  return renderValue(row[column]);
}

function renderSettingSummary(key: string, value: unknown) {
  if (key === "offices" && Array.isArray(value)) {
    return `${value.length} văn phòng`;
  }

  const data = asRecord(value);
  if (key === "site") {
    return [data.name, data.hotline, data.email].filter(Boolean).join(" - ");
  }

  return renderValue(value);
}
