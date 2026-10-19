"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

// Hiện khi một trang bị lỗi lúc đang chạy. Header vẫn còn (vì nằm trong layout).
export default function LoiTrang({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Lỗi giao diện:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-paper p-6">
      <div className="max-w-sm text-center flex flex-col items-center gap-3">
        <AlertTriangle className="w-10 h-10 text-rust" />
        <h1 className="text-xl font-bold text-ink">Có lỗi xảy ra</h1>
        <p className="text-sm text-ink-soft">
          Trang này không tải được. Bạn thử lại nhé. Nếu lỗi cứ lặp lại, hãy liên hệ hỗ trợ ở cuối trang chủ.
        </p>
        {error.digest && (
          <p className="text-xs text-ink-soft font-mono">Mã lỗi: {error.digest}</p>
        )}
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => reset()}
            className="bg-rust hover:opacity-90 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
          >
            Thử lại
          </button>
          <Link
            href="/"
            className="bg-card border border-line text-ink-soft hover:bg-line px-5 py-2.5 rounded-xl text-sm font-semibold transition"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}