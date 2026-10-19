import Link from "next/link";
import type { ReactNode } from "react";
import { THONG_TIN_DON_VI as T, PHIEN_BAN_PHAP_LY } from "../lib/thongTinDonVi";

const CAC_TRANG = [
  { href: "/dieu-khoan", nhan: "Điều khoản sử dụng" },
  { href: "/bao-mat", nhan: "Bảo vệ dữ liệu cá nhân" },
  { href: "/quy-che", nhan: "Quy chế hoạt động" },
];

export function P({ children }: { children: ReactNode }) {
  return <p className="text-sm text-ink-soft leading-relaxed">{children}</p>;
}

export function Ds({ children }: { children: ReactNode }) {
  return (
    <ul className="list-disc pl-5 flex flex-col gap-1.5 text-sm text-ink-soft leading-relaxed">
      {children}
    </ul>
  );
}

export function Muc({ so, tieuDe, children }: { so: number; tieuDe: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-base font-bold text-ink">
        {so}. {tieuDe}
      </h2>
      {children}
    </section>
  );
}

export function KhoiChuQuan() {
  const dong: [string, string][] = [
    ["Tên nền tảng", T.tenNenTang],
    ["Địa chỉ web", T.tenMien],
    ["Đơn vị / cá nhân vận hành", T.tenChuQuan],
    ["Loại hình", T.loaiHinh],
    ["Giấy tờ pháp lý", T.giayToPhapLy],
    ["Địa chỉ liên hệ", T.diaChi],
    ["Điện thoại / Zalo hỗ trợ", T.soDienThoai],
    ["Email hỗ trợ", T.email],
    ["Xác nhận đăng ký thương mại điện tử", T.xacNhanDangKy],
  ];
  return (
    <div className="border border-line rounded-xl overflow-hidden text-sm">
      {dong.map(([nhan, giaTri]) => (
        <div key={nhan} className="flex flex-col sm:flex-row sm:gap-4 px-4 py-2.5 border-b border-line last:border-0">
          <span className="sm:w-56 shrink-0 font-semibold text-ink">{nhan}</span>
          <span className="text-ink-soft break-words">{giaTri}</span>
        </div>
      ))}
    </div>
  );
}

export default function TrangPhapLy({
  tieuDe,
  hienTai,
  children,
}: {
  tieuDe: string;
  hienTai: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper py-8 px-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-5">
        <Link href="/" className="self-start text-sm text-rust hover:underline font-medium">
          ← Trang chủ
        </Link>

        <nav className="flex flex-wrap gap-2">
          {CAC_TRANG.map((trang) => (
            <Link
              key={trang.href}
              href={trang.href}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                trang.href === hienTai
                  ? "bg-rust text-white border-rust"
                  : "bg-card text-ink-soft border-line hover:bg-line"
              }`}
            >
              {trang.nhan}
            </Link>
          ))}
        </nav>

        <div className="bg-card border border-line rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold text-ink">{tieuDe}</h1>
            <p className="text-xs text-ink-soft mt-1 font-mono">
              Cập nhật lần cuối: {PHIEN_BAN_PHAP_LY.ngayCapNhat} · Phiên bản {PHIEN_BAN_PHAP_LY.ma}
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}