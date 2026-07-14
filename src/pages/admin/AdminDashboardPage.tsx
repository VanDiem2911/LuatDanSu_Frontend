import { useQuery } from "@tanstack/react-query";
import { Activity, Database, FileText, MessageSquare, PhoneCall } from "lucide-react";
import { Link } from "react-router-dom";
import { listAdminResource } from "../../services/cms";

const stats = [
  { resource: "articles", label: "Bài viết mới", icon: FileText },
  { resource: "leads", label: "SĐT gửi trong tháng", icon: PhoneCall },
  { resource: "comments", label: "Câu hỏi mới", icon: MessageSquare },
  { resource: "videos", label: "Video tư vấn", icon: Activity }
];

const chart = [920, 1480, 1710, 2180, 2700, 2920, 3320, 3860, 4140, 4520, 5070, 5380, 5730, 6280, 6735];
const previousChart = [760, 1040, 1210, 1660, 1890, 2040, 2470, 2890, 3090, 3410, 3790, 3940, 4310, 4720, 5030];

export function AdminDashboardPage() {
  const queries = stats.map((card) =>
    useQuery({
      queryKey: ["admin-count", card.resource],
      queryFn: () => listAdminResource(card.resource, { limit: 1 })
    })
  );

  const leads = useQuery({
    queryKey: ["admin-dashboard-leads"],
    queryFn: () => listAdminResource("leads", { limit: 5, sort: "createdAt", order: "desc" })
  });

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="section-title text-[1.7rem]">Dashboard thống kê</h1>
        <button className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-8 py-4 text-base font-black text-slate-700 shadow-sm">
          <Database className="h-5 w-5 text-primary" />
          Sao lưu dữ liệu
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((card, index) => {
          const Icon = card.icon;
          const query = queries[index];
          return (
            <div key={card.resource} className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-slate-500">{card.label}</p>
                  <p className="mt-6 text-4xl font-black text-navy">{query.isLoading ? "..." : query.data?.meta.total ?? 0}</p>
                  <p className="mt-2 text-lg font-black text-emerald-500">0% ↗</p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_360px]">
        <section className="border border-slate-200 bg-white p-8">
          <h2 className="section-title mb-8 text-[1.35rem]">Biểu đồ truy cập</h2>
          <div className="mb-8 flex items-center gap-8 text-base font-semibold text-slate-600">
            <span className="flex items-center gap-2"><i className="h-4 w-4 rounded-full bg-primary" />Tháng này</span>
            <span className="flex items-center gap-2"><i className="h-4 w-4 rounded-full bg-orange-500" />Tháng trước</span>
          </div>
          <div className="relative h-[320px] w-full mt-4">
            <svg viewBox="-55 0 775 300" className="h-full w-full overflow-visible">
              {/* Horizontal Grid Lines */}
              {[20, 80, 140, 200, 260].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="700"
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1.5"
                />
              ))}

              {/* Vertical Grid Lines */}
              {[100, 200, 300, 400, 500, 600].map((x) => (
                <line
                  key={x}
                  x1={x}
                  y1="20"
                  x2={x}
                  y2="260"
                  stroke="#f8fafc"
                  strokeWidth="1.5"
                />
              ))}

              {/* Y-axis Labels */}
              <text x="-15" y="24" textAnchor="end" fill="#94a3b8" fontSize="12" fontWeight="bold">7.000</text>
              <text x="-15" y="84" textAnchor="end" fill="#94a3b8" fontSize="12" fontWeight="bold">5.250</text>
              <text x="-15" y="144" textAnchor="end" fill="#94a3b8" fontSize="12" fontWeight="bold">3.500</text>
              <text x="-15" y="204" textAnchor="end" fill="#94a3b8" fontSize="12" fontWeight="bold">1.750</text>
              <text x="-15" y="264" textAnchor="end" fill="#94a3b8" fontSize="12" fontWeight="bold">0</text>

              {/* X-axis Labels */}
              <text x="0" y="292" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">Ngày 1</text>
              <text x="100" y="292" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">Ngày 5</text>
              <text x="200" y="292" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">Ngày 9</text>
              <text x="300" y="292" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">Ngày 13</text>
              <text x="400" y="292" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">Ngày 17</text>
              <text x="500" y="292" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">Ngày 21</text>
              <text x="600" y="292" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">Ngày 25</text>
              <text x="700" y="292" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">Ngày 30</text>

              {/* Axes Lines */}
              <line x1="0" y1="20" x2="0" y2="260" stroke="#cbd5e1" strokeWidth="2" />
              <line x1="0" y1="260" x2="700" y2="260" stroke="#cbd5e1" strokeWidth="2" />

              {/* Polylines */}
              <polyline
                points={chart.map((value, index) => `${(index / 14) * 700},${260 - (value / 7000) * 240}`).join(" ")}
                fill="none"
                stroke="#4a51e0"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points={previousChart.map((value, index) => `${(index / 14) * 700},${260 - (value / 7000) * 240}`).join(" ")}
                fill="none"
                stroke="#f97316"
                strokeDasharray="6 6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Point Circles */}
              {chart.map((value, index) => {
                const cx = (index / 14) * 700;
                const cy = 260 - (value / 7000) * 240;
                return (
                  <circle
                    key={`c1-${index}`}
                    cx={cx}
                    cy={cy}
                    r="5"
                    fill="#4a51e0"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                );
              })}
              {previousChart.map((value, index) => {
                const cx = (index / 14) * 700;
                const cy = 260 - (value / 7000) * 240;
                return (
                  <circle
                    key={`c2-${index}`}
                    cx={cx}
                    cy={cy}
                    r="4"
                    fill="#f97316"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                );
              })}
            </svg>
          </div>
        </section>

        <section className="flex min-h-[430px] flex-col border border-slate-200 bg-white p-8">
          <h2 className="section-title text-[1.35rem]">SĐT tư vấn mới</h2>
          <div className="mt-8 flex flex-1 flex-col justify-center">
            {leads.data?.data.length ? (
              <div className="divide-y divide-slate-100">
                {leads.data.data.map((lead) => (
                  <div key={String(lead._id)} className="py-3">
                    <p className="font-black text-slate-800">{String(lead.phone ?? "")}</p>
                    <p className="line-clamp-1 text-sm font-medium text-slate-500">
                      Nguồn: {String(lead.source ?? "website")} - Trạng thái: {String(lead.status ?? "new")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-xl font-medium text-slate-400">Không có dữ liệu mới</p>
            )}
          </div>
          <Link to="/admin/leads" className="mt-6 inline-flex items-center justify-center gap-2 text-sm font-black text-primary">
            Xem tất cả <span>›</span>
          </Link>
        </section>
      </div>
    </div>
  );
}
