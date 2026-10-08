import { BellRing } from "lucide-react";

export type MucNhac = {
  id: number;
  // Dòng nhận diện đơn bằng thông tin người dùng nhớ được (tên + giờ hẹn), KHÔNG dùng mã đơn.
  // Bỏ trống ở nơi chỉ có một đơn (trang chi tiết đơn).
  tieuDe?: string;
  noiDung: string;
};

// Thông báo nhỏ đầu trang "Đơn của tôi" khi có đơn bị bỏ quên.
// Nội dung từng dòng do layNhacDon (lib/gioHen.ts) quyết định. Nếu truyền onChon,
// mỗi dòng có nút "Xem đơn" để nhảy tới đúng thẻ đơn trong danh sách.
export default function NhacDonBoQuen({
  muc,
  onChon,
}: {
  muc: MucNhac[];
  onChon?: (id: number) => void;
}) {
  if (muc.length === 0) return null;
  return (
    <div className="mb-6 bg-gold-soft border border-gold/30 rounded-2xl p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-gold mb-2">
        <BellRing className="w-4 h-4" /> Có {muc.length} đơn cần bạn chú ý
      </p>
      <ul className="flex flex-col gap-2.5">
        {muc.map((m) => (
          <li key={m.id} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {m.tieuDe && <p className="text-sm font-semibold text-ink">{m.tieuDe}</p>}
              <p className="text-sm text-ink-soft">{m.noiDung}</p>
            </div>
            {onChon && (
              <button
                onClick={() => onChon(m.id)}
                className="shrink-0 text-xs font-semibold text-gold border border-gold/40 hover:bg-gold hover:text-white px-2.5 py-1 rounded-lg transition"
              >
                Xem đơn
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}