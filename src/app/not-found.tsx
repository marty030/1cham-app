import Link from "next/link";
import { SearchX } from "lucide-react";

// Hiện khi vào một đường dẫn không tồn tại (404)
export default function KhongTimThayTrang() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-paper p-6">
      <div className="max-w-sm text-center flex flex-col items-center gap-3">
        <SearchX className="w-10 h-10 text-ink-soft" />
        <h1 className="text-xl font-bold text-ink">Không tìm thấy trang này</h1>
        <p className="text-sm text-ink-soft">
          Đường dẫn có thể đã sai hoặc trang đã bị xóa.
        </p>
        <div className="flex gap-2 mt-2">
          <Link
            href="/"
            className="bg-rust hover:opacity-90 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
          >
            Về trang chủ
          </Link>
          <Link
            href="/tho-gan-ban"
            className="bg-card border border-line text-ink-soft hover:bg-line px-5 py-2.5 rounded-xl text-sm font-semibold transition"
          >
            Tìm thợ gần bạn
          </Link>
        </div>
      </div>
    </div>
  );
}