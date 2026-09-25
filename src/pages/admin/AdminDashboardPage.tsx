import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useMemo } from "react";
import { Activity, Database, FileText, MessageSquare, PhoneCall, TrendingUp, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import JSZip from "jszip";
import { getAdminDashboard, getBackupData } from "../../services/cms";

function formatRelativeTime(dateString?: string) {
  if (!dateString) return "Mới đây";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Mới đây";

  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return "Vừa xong";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} ngày trước`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} tháng trước`;
  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} năm trước`;
}

// Generate smooth cubic bezier SVG path from coordinates
function getSplinePath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return "";
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export function AdminDashboardPage() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [timeRange, setTimeRange] = useState<"30" | "7">("30");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const dashboard = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboard,
    staleTime: 30_000
  });

  async function handleBackupClick() {
    if (isBackingUp) return;
    try {
      setIsBackingUp(true);
      const data = await getBackupData();

      const zip = new JSZip();
      for (const [collectionName, documents] of Object.entries(data)) {
        zip.file(`${collectionName}.json`, JSON.stringify(documents, null, 2));
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];
      link.href = url;
      link.setAttribute("download", `luatdansu_backup_${dateStr}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Backup failed:", error);
      alert("Sao lưu dữ liệu thất bại!");
    } finally {
      setIsBackingUp(false);
    }
  }

  // Real leads and analytics from database
  const recentLeads = dashboard.data?.recentLeads ?? [];
  const analytics = dashboard.data?.analytics;
  const weeklyViews = dashboard.data?.counts.views ?? 0;
  const weekGrowth = dashboard.data?.counts.weekGrowth ?? 0;

  // Real time-series data from backend
  const chartData = useMemo(() => {
    if (analytics) {
      if (timeRange === "7" && analytics.chartData7 && analytics.chartData7.length > 0) {
        return analytics.chartData7;
      }
      if (timeRange === "30" && analytics.chartData30 && analytics.chartData30.length > 0) {
        return analytics.chartData30;
      }
    }
    const daysCount = timeRange === "7" ? 7 : 30;
    return Array.from({ length: daysCount }, (_, i) => ({
      day: i + 1,
      label: timeRange === "7" ? `Thứ ${i + 2 <= 7 ? i + 2 : "CN"}` : `Ngày ${i + 1}`,
      current: 0,
      previous: 0,
      unique: 0,
      date: ""
    }));
  }, [timeRange, analytics]);

  // Compute SVG Plot geometry
  const SVG_WIDTH = 650;
  const SVG_HEIGHT = 260;
  const PAD_LEFT = 50;
  const PAD_RIGHT = 25;
  const PAD_TOP = 25;
  const PAD_BOTTOM = 40;
  const PLOT_W = SVG_WIDTH - PAD_LEFT - PAD_RIGHT;
  const PLOT_H = SVG_HEIGHT - PAD_TOP - PAD_BOTTOM;
  const BASELINE_Y = PAD_TOP + PLOT_H;

  // Determine Max Y value rounded nicely
  const maxVal = useMemo(() => {
    const highest = Math.max(...chartData.map((d) => Math.max(d.current, d.previous)), 10);
    if (highest <= 100) return 100;
    if (highest <= 500) return 500;
    if (highest <= 1000) return 1000;
    return Math.ceil(highest / 400) * 400;
  }, [chartData]);

  // Y-axis ticks (5 levels: 0, 25%, 50%, 75%, 100%)
  const yAxisTicks = useMemo(() => {
    return [
      { val: maxVal, y: PAD_TOP },
      { val: Math.round(maxVal * 0.75), y: PAD_TOP + PLOT_H * 0.25 },
      { val: Math.round(maxVal * 0.5), y: PAD_TOP + PLOT_H * 0.5 },
      { val: Math.round(maxVal * 0.25), y: PAD_TOP + PLOT_H * 0.75 },
      { val: 0, y: BASELINE_Y }
    ];
  }, [maxVal, BASELINE_Y, PLOT_H]);

  // Map data to SVG points
  const pointsCurrent = useMemo(() => {
    const len = chartData.length;
    return chartData.map((item, idx) => ({
      x: PAD_LEFT + (idx / (len - 1)) * PLOT_W,
      y: BASELINE_Y - (item.current / maxVal) * PLOT_H
    }));
  }, [chartData, maxVal, PLOT_W, PLOT_H, BASELINE_Y]);

  const pointsPrevious = useMemo(() => {
    const len = chartData.length;
    return chartData.map((item, idx) => ({
      x: PAD_LEFT + (idx / (len - 1)) * PLOT_W,
      y: BASELINE_Y - (item.previous / maxVal) * PLOT_H
    }));
  }, [chartData, maxVal, PLOT_W, PLOT_H, BASELINE_Y]);

  const currentSpline = useMemo(() => getSplinePath(pointsCurrent), [pointsCurrent]);
  const previousSpline = useMemo(() => getSplinePath(pointsPrevious), [pointsPrevious]);

  // Area under current curve
  const currentArea = useMemo(() => {
    if (pointsCurrent.length === 0) return "";
    const firstX = pointsCurrent[0].x;
    const lastX = pointsCurrent[pointsCurrent.length - 1].x;
    return `${currentSpline} L ${lastX.toFixed(1)} ${BASELINE_Y} L ${firstX.toFixed(1)} ${BASELINE_Y} Z`;
  }, [currentSpline, pointsCurrent, BASELINE_Y]);

  // Handle Mouse Hover on SVG
  function handleSvgMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * SVG_WIDTH;
    const relX = Math.max(0, Math.min(PLOT_W, mouseX - PAD_LEFT));
    const idx = Math.round((relX / PLOT_W) * (chartData.length - 1));
    setHoveredIndex(Math.max(0, Math.min(chartData.length - 1, idx)));
  }

  const activeItem = hoveredIndex !== null ? chartData[hoveredIndex] : null;
  const activePtCur = hoveredIndex !== null ? pointsCurrent[hoveredIndex] : null;
  const activePtPrev = hoveredIndex !== null ? pointsPrevious[hoveredIndex] : null;

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="h-6 w-1 rounded-full bg-[#2563eb]" />
          <h1 className="text-xl font-bold uppercase tracking-wider text-slate-800">
            DASHBOARD THỐNG KÊ
          </h1>
        </div>

        <button
          onClick={handleBackupClick}
          disabled={isBackingUp}
          className="inline-flex items-center gap-2 rounded-full border border-blue-200/90 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-blue-50/50 hover:border-blue-300 active:scale-95 disabled:opacity-50"
        >
          <Database className={`h-4 w-4 text-[#2563eb] ${isBackingUp ? "animate-spin" : ""}`} />
          <span>{isBackingUp ? "Đang sao lưu..." : "Sao lưu dữ liệu"}</span>
        </button>
      </div>

      {/* 4 Stat Cards Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Truy cập / Lượt xem */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-slate-500">Truy cập trong tuần</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edf4ff] text-[#2563eb]">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            {dashboard.isLoading ? "..." : weeklyViews.toLocaleString("vi-VN")}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs font-bold">
            <span className={weekGrowth >= 0 ? "text-[#10b981]" : "text-rose-500"}>
              {weekGrowth >= 0 ? `+${weekGrowth}%` : `${weekGrowth}%`}
            </span>
            <span className={weekGrowth >= 0 ? "text-[#10b981]" : "text-rose-500"}>
              {weekGrowth >= 0 ? "↗" : "↘"}
            </span>
            <span className="text-slate-400 font-normal ml-1">so với tuần trước</span>
          </div>
        </div>

        {/* Card 2: SĐT gửi trong tháng */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-slate-500">SĐT gửi trong tháng</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edf4ff] text-[#2563eb]">
              <PhoneCall className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            {dashboard.isLoading ? "..." : dashboard.data?.counts.leads ?? 0}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs font-bold text-[#10b981]">
            <span>0%</span>
            <span>↗</span>
          </div>
        </div>

        {/* Card 3: Bài viết mới */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-slate-500">Bài viết mới</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edf4ff] text-[#2563eb]">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            {dashboard.isLoading ? "..." : dashboard.data?.counts.articles ?? 0}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs font-bold text-[#10b981]">
            <span>0%</span>
            <span>↗</span>
          </div>
        </div>

        {/* Card 4: Câu hỏi mới */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-slate-500">Câu hỏi mới</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edf4ff] text-[#2563eb]">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            {dashboard.isLoading ? "..." : dashboard.data?.counts.comments ?? 0}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs font-bold text-[#10b981]">
            <span>0%</span>
            <span>↗</span>
          </div>
        </div>
      </div>

      {/* Main Content: Interactive Chart & Recent Leads */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
        {/* Left: Biểu đồ truy cập trực quan */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="h-5 w-1 rounded-full bg-[#2563eb]" />
              <h2 className="text-base font-bold uppercase tracking-wider text-slate-800">
                BIỂU ĐỒ TRUY CẬP
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTimeRange("30")}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                  timeRange === "30"
                    ? "bg-[#2563eb] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                30 ngày qua
              </button>
              <button
                type="button"
                onClick={() => setTimeRange("7")}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                  timeRange === "7"
                    ? "bg-[#2563eb] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                7 ngày qua
              </button>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-6 text-xs font-medium text-slate-600">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#2563eb]" />
              Tháng này
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f97316]" />
              Tháng trước
            </span>
          </div>

          {/* Interactive SVG Chart Container */}
          <div className="relative h-[280px] w-full select-none">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              className="h-full w-full cursor-crosshair overflow-visible"
              onMouseMove={handleSvgMouseMove}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <defs>
                <linearGradient id="chartBlueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines and Y-axis labels */}
              {yAxisTicks.map(({ val, y }) => (
                <g key={val}>
                  <line
                    x1={PAD_LEFT}
                    y1={y}
                    x2={SVG_WIDTH - PAD_RIGHT}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeWidth="1.2"
                  />
                  <text
                    x={PAD_LEFT - 10}
                    y={y + 4}
                    textAnchor="end"
                    fill="#94a3b8"
                    fontSize="11"
                    fontWeight="600"
                  >
                    {val.toLocaleString("vi-VN")}
                  </text>
                </g>
              ))}

              {/* Area under Month Curve */}
              <path d={currentArea} fill="url(#chartBlueGrad)" />

              {/* Orange Dashed Curve (Tháng trước) */}
              <path
                d={previousSpline}
                fill="none"
                stroke="#f97316"
                strokeWidth="2"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />

              {/* Blue Curve (Tháng này) */}
              <path
                d={currentSpline}
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* X-axis Ticks & Labels */}
              {chartData.map((item, idx) => {
                const len = chartData.length;
                const shouldShow =
                  timeRange === "7" ||
                  idx === 0 ||
                  idx === 4 ||
                  idx === 9 ||
                  idx === 14 ||
                  idx === 19 ||
                  idx === 24 ||
                  idx === len - 1;

                if (!shouldShow) return null;
                const x = PAD_LEFT + (idx / (len - 1)) * PLOT_W;

                return (
                  <g key={`x-${idx}`}>
                    <line
                      x1={x}
                      y1={BASELINE_Y}
                      x2={x}
                      y2={BASELINE_Y + 5}
                      stroke="#cbd5e1"
                      strokeWidth="1"
                    />
                    <text
                      x={x}
                      y={BASELINE_Y + 20}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="11"
                      fontWeight="600"
                    >
                      {item.label}
                    </text>
                  </g>
                );
              })}

              {/* Hover Guidelines and Highlight Dots */}
              {hoveredIndex !== null && activePtCur && activePtPrev && (
                <g>
                  {/* Vertical Guideline */}
                  <line
                    x1={activePtCur.x}
                    y1={PAD_TOP}
                    x2={activePtCur.x}
                    y2={BASELINE_Y}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />

                  {/* Previous Dot (Orange) */}
                  <circle
                    cx={activePtPrev.x}
                    cy={activePtPrev.y}
                    r="4.5"
                    fill="#f97316"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />

                  {/* Current Dot (Blue) */}
                  <circle
                    cx={activePtCur.x}
                    cy={activePtCur.y}
                    r="6"
                    fill="#2563eb"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                  />
                </g>
              )}
            </svg>

            {/* Hover Floating Tooltip */}
            {hoveredIndex !== null && activeItem && activePtCur && (
              <div
                className="pointer-events-none absolute z-20 min-w-[170px] rounded-xl bg-slate-900/95 p-3 text-white shadow-xl backdrop-blur-sm transition-all"
                style={{
                  left: `${(activePtCur.x / SVG_WIDTH) * 100}%`,
                  top: "15%",
                  transform:
                    activePtCur.x > SVG_WIDTH * 0.6
                      ? "translate(-105%, -15%)"
                      : "translate(10%, -15%)"
                }}
              >
                <p className="border-b border-slate-700/80 pb-1.5 text-xs font-bold text-slate-300">
                  {activeItem.label} {activeItem.date ? `(${activeItem.date})` : ""}
                </p>
                <div className="mt-2 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-blue-400">
                      <span className="h-2 w-2 rounded-full bg-[#3b82f6]" />
                      Lượt xem:
                    </span>
                    <span className="font-extrabold text-white">
                      {activeItem.current.toLocaleString("vi-VN")}
                    </span>
                  </div>
                  {Boolean(activeItem.unique) && (
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Khách thực tế:
                      </span>
                      <span className="font-extrabold text-white">
                        {activeItem.unique?.toLocaleString("vi-VN")}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-orange-400">
                      <span className="h-2 w-2 rounded-full bg-[#f97316]" />
                      Kỳ trước:
                    </span>
                    <span className="font-bold text-slate-200">
                      {activeItem.previous.toLocaleString("vi-VN")}
                    </span>
                  </div>
                  {activeItem.previous > 0 ? (
                    <div className="pt-1.5 border-t border-slate-700/60 flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-slate-400">Tăng trưởng:</span>
                      <span className={activeItem.current >= activeItem.previous ? "text-emerald-400" : "text-rose-400"}>
                        {activeItem.current >= activeItem.previous ? "+" : ""}
                        {Math.round(((activeItem.current - activeItem.previous) / activeItem.previous) * 100)}% {activeItem.current >= activeItem.previous ? "↗" : "↘"}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: SĐT tư vấn mới (Dữ liệu thật từ Database) */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="h-5 w-1 rounded-full bg-[#2563eb]" />
                <h2 className="text-base font-bold uppercase tracking-wider text-slate-800">
                  SĐT TƯ VẤN MỚI
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {recentLeads.length} liên hệ
              </span>
            </div>

            {recentLeads.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {recentLeads.map((lead: any, idx: number) => {
                  const phone = String(lead.phone ?? "");
                  const time = formatRelativeTime(lead.createdAt as string | undefined);
                  const isContacted = lead.status === "contacted";

                  return (
                    <div key={lead._id || idx} className="flex items-center justify-between py-4 first:pt-2">
                      <div>
                        <p className="text-[15px] font-bold text-slate-800">
                          {phone}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {time} {lead.source ? `• Nguồn: ${lead.source}` : ""}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3.5 py-1 text-xs font-semibold ${
                          isContacted
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-[#edf4ff] text-[#2563eb]"
                        }`}
                      >
                        {isContacted ? "Đã gọi" : "Chưa gọi"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                <PhoneCall className="h-8 w-8 text-slate-300 mb-2 stroke-[1.5]" />
                <p className="text-sm font-medium">Chưa có số điện thoại nào</p>
                <p className="text-xs text-slate-400 mt-1">Khi khách hàng gửi form, số điện thoại sẽ xuất hiện tại đây</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-50 mt-4 text-center">
            <Link
              to="/admin/leads"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563eb] hover:text-blue-700 transition"
            >
              <span>Xem tất cả danh sách</span>
              <span>›</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
