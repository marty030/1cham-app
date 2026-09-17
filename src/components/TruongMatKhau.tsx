"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type TruongMatKhauProps = {
  value: string;
  onChange: (giaTri: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  loi?: boolean; // true -> tô viền đỏ (dữ liệu chưa hợp lệ)
  className?: string;
};

/**
 * Ô nhập mật khẩu dùng chung cho toàn site — có nút con mắt để hiện/ẩn mật
 * khẩu, và viền đỏ khi `loi` = true (ví dụ: để trống, hoặc 2 ô mật khẩu
 * không khớp).
 */
export default function TruongMatKhau({
  value,
  onChange,
  onBlur,
  placeholder,
  loi,
  className = "",
}: TruongMatKhauProps) {
  const [hienMatKhau, setHienMatKhau] = useState(false);

  return (
    <div className="relative">
      <input
        type={hienMatKhau ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`border rounded-lg px-3 py-2 pr-10 w-full outline-none transition ${
          loi ? "border-rust focus:border-rust" : "border-line focus:border-teal"
        } ${className}`}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setHienMatKhau((v) => !v)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink transition"
      >
        {hienMatKhau ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}