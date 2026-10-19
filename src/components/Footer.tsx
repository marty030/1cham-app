import Link from "next/link";
import { MessageCircle, Phone, MapPin } from "lucide-react";

const SDT_ADMIN = "0865455171"; // Số Zalo/hotline admin để nhận báo lỗi/khiếu nại

export default function Footer() {
  return (
    <footer className="bg-card border-t border-line mt-4">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <div className="font-bold text-ink mb-2">Thợ Xịn</div>
          <p className="text-sm text-ink-soft leading-relaxed">
            Kết nối khách hàng với thợ sửa chữa - bảo trì gia dụng uy tín, minh bạch.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="font-semibold text-ink text-sm">Liên hệ hỗ trợ</div>

          <a
            href={`tel:${SDT_ADMIN}`}
            className="flex items-center gap-2 text-sm text-ink-soft hover:text-teal transition"
          >
            <Phone className="w-4 h-4 shrink-0" /> {SDT_ADMIN}
          </a>

          <a
            href={`https://zalo.me/${SDT_ADMIN}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-ink-soft hover:text-teal transition"
          >
            <MessageCircle className="w-4 h-4 shrink-0" /> Chat Zalo hỗ trợ
          </a>
        </div>

        <div className="flex flex-col gap-3">
          <div className="font-semibold text-ink text-sm">Khu vực hoạt động</div>
          <div className="flex items-start gap-2 text-sm text-ink-soft">
            <MapPin className="w-4 h-4 shrink-0 mt-0.5" /> Hà Nội
          </div>
        </div>
      </div>

      <div className="border-t border-line px-4 sm:px-6 py-4 flex flex-col items-center gap-2 text-xs text-ink-soft">
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-1">
          <Link href="/dieu-khoan" className="hover:text-teal transition">Điều khoản sử dụng</Link>
          <Link href="/bao-mat" className="hover:text-teal transition">Bảo vệ dữ liệu cá nhân</Link>
          <Link href="/quy-che" className="hover:text-teal transition">Quy chế hoạt động</Link>
        </div>
        <div>© {new Date().getFullYear()} Thợ Xịn</div>
      </div>
    </footer>
  );
}