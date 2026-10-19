"use client";

import "./globals.css";

// Lưới an toàn cuối cùng: chỉ hiện khi chính layout gốc bị lỗi (hiếm). Phải tự có <html> và <body>.
export default function LoiToanTrang({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("Lỗi toàn trang:", error);

  return (
    <html lang="vi">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-paper p-6">
          <div className="max-w-sm text-center flex flex-col items-center gap-3">
            <h1 className="text-xl font-bold text-ink">Web đang gặp sự cố</h1>
            <p className="text-sm text-ink-soft">
              Bạn thử tải lại trang nhé. Nếu vẫn lỗi, vui lòng quay lại sau ít phút.
            </p>
            {error.digest && (
              <p className="text-xs text-ink-soft font-mono">Mã lỗi: {error.digest}</p>
            )}
            <button
              onClick={() => reset()}
              className="bg-rust hover:opacity-90 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition mt-2"
            >
              Tải lại
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}