import { Hourglass, ThumbsUp, CheckCircle2, XCircle, type LucideIcon } from "lucide-react";

type CauHinh = { text: string; mau: string; Icon: LucideIcon | null };

const CAU_HINH_TRANG_THAI: Record<string, CauHinh> = {
  "Chờ xác nhận": { text: "Chờ thợ xác nhận", mau: "bg-gold-soft text-gold border-gold/20", Icon: Hourglass },
  "Đã xác nhận": { text: "Thợ đã xác nhận", mau: "bg-teal-soft text-teal border-teal/20", Icon: ThumbsUp },
  "Đã hoàn thành": { text: "Đã hoàn thành", mau: "bg-teal text-white border-teal", Icon: CheckCircle2 },
  "Đã hủy": { text: "Đã hủy", mau: "bg-rust-soft text-rust border-rust/20", Icon: XCircle },
};

export function layCauHinhTrangThai(trangThai: string): CauHinh {
  return (
    CAU_HINH_TRANG_THAI[trangThai] ?? {
      text: trangThai,
      mau: "bg-line text-ink-soft border-line",
      Icon: null,
    }
  );
}

export default function NhanTrangThai({
  trangThai,
  className = "",
}: {
  trangThai: string;
  className?: string;
}) {
  const { text, mau, Icon } = layCauHinhTrangThai(trangThai);
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${mau} ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />} {text}
    </span>
  );
}