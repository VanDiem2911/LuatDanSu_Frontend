export function ErrorState({ title = "Không tải được dữ liệu" }: { title?: string }) {
  return (
    <div className="border border-red-100 bg-red-50 p-6 text-red-700">
      <h2 className="font-bold">{title}</h2>
      <p className="mt-2 text-sm">Vui lòng kiểm tra kết nối API hoặc thử lại sau.</p>
    </div>
  );
}
