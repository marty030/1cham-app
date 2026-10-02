import { Clock, MapPin } from "lucide-react";
import { TUY_CHON_GIO_VN } from "../lib/thoiGianVN";

// Tách giờ hẹn thành các phần riêng để hiển thị có thứ bậc:
// giờ (to nhất) → thứ/ngày → nhãn "Hôm nay"/"Ngày mai" nếu có.
export function phanTichGioHen(iso: string) {
  const d = new Date(iso);
  const gio = d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...TUY_CHON_GIO_VN,
  });
  const ngay = d.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    ...TUY_CHON_GIO_VN,
  });

  // So sánh theo ngày lịch ở múi giờ VN (en-CA cho ra dạng YYYY-MM-DD).
  const khoaNgay = (t: Date) => t.toLocaleDateString("en-CA", TUY_CHON_GIO_VN);
  const bayGio = Date.now();
  let nhan: "Hôm nay" | "Ngày mai" | null = null;
  if (khoaNgay(d) === khoaNgay(new Date(bayGio))) nhan = "Hôm nay";
  else if (khoaNgay(d) === khoaNgay(new Date(bayGio + 24 * 60 * 60 * 1000))) nhan = "Ngày mai";

  return { gio, ngay, nhan };
}

// Dạng gọn một dòng, không có giây: "14:30 · Thứ Năm, 01/10"
export function dinhDangGioNgan(iso: string) {
  const { gio, ngay } = phanTichGioHen(iso);
  return `${gio} · ${ngay}`;
}

type KhoiLichHenProps = {
  gioHen: string;
  diaChi: string;
  nhanGio?: string; // mặc định "Giờ hẹn"
  gioiHanDong?: boolean; // true: địa chỉ tối đa 2 dòng (thẻ trong danh sách)
};

// Khối "lịch hẹn + địa chỉ" dùng chung cho mọi nơi hiển thị đơn: mỗi dòng có
// nhãn nhỏ nói rõ đó là thông tin gì, còn giá trị thì to và đậm để quét mắt là thấy.
export default function KhoiLichHen({
  gioHen,
  diaChi,
  nhanGio = "Giờ hẹn",
  gioiHanDong = false,
}: KhoiLichHenProps) {
  const { gio, ngay, nhan } = phanTichGioHen(gioHen);

  return (
    <div className="bg-paper border border-line rounded-xl divide-y divide-line">
      <div className="flex items-start gap-3 p-3.5">
        <span className="w-8 h-8 rounded-full bg-teal-soft text-teal flex items-center justify-center shrink-0">
          <Clock className="w-4 h-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
            {nhanGio}
          </p>
          <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-ink">
            <span className="text-xl font-bold tabular-nums leading-tight">{gio}</span>
            <span className="text-sm font-semibold">{ngay}</span>
            {nhan && (
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  nhan === "Hôm nay" ? "bg-rust-soft text-rust" : "bg-gold-soft text-gold"
                }`}
              >
                {nhan}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 p-3.5">
        <span className="w-8 h-8 rounded-full bg-rust-soft text-rust flex items-center justify-center shrink-0">
          <MapPin className="w-4 h-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
            Địa chỉ
          </p>
          <p
            className={`text-sm font-semibold text-ink leading-snug ${
              gioiHanDong ? "line-clamp-2" : ""
            }`}
          >
            {diaChi}
          </p>
        </div>
      </div>
    </div>
  );
}