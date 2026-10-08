import { CheckCircle2, Circle } from "lucide-react";

type ThanhHaiBuocProps = {
  thoXacNhan: boolean;
  khachXacNhan: boolean;
  vaiTro: "tho" | "khach";
};

function Buoc({ ten, xong, laBan }: { ten: string; xong: boolean; laBan: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1 min-w-[84px]">
      {xong ? (
        <CheckCircle2 className="w-6 h-6 text-teal" />
      ) : (
        <Circle className="w-6 h-6 text-ink-soft/40" />
      )}
      <span className={`text-xs font-semibold ${xong ? "text-teal" : "text-ink"}`}>
        {ten}
        {laBan ? " (bạn)" : ""}
      </span>
      <span className="text-[11px] text-ink-soft">{xong ? "Đã xác nhận" : "Chưa xác nhận"}</span>
    </div>
  );
}

// Thanh 2 bước cho việc hoàn thành đơn: cho cả thợ và khách thấy ngay mình đang ở bước nào
// và vì sao đơn chưa hoàn thành (đơn chỉ hoàn thành khi CẢ HAI cùng xác nhận).
export default function ThanhHaiBuoc({ thoXacNhan, khachXacNhan, vaiTro }: ThanhHaiBuocProps) {
  const toiDaBam = vaiTro === "tho" ? thoXacNhan : khachXacNhan;
  const beKiaDaBam = vaiTro === "tho" ? khachXacNhan : thoXacNhan;
  const tenBeKia = vaiTro === "tho" ? "khách" : "thợ";

  let dongGiaiThich: string;
  if (thoXacNhan && khachXacNhan) {
    dongGiaiThich = "Cả hai bên đã xác nhận — đơn đã hoàn thành.";
  } else if (toiDaBam) {
    dongGiaiThich = `Bạn đã xác nhận. Đang chờ ${tenBeKia} xác nhận để hoàn tất đơn.`;
  } else if (beKiaDaBam) {
    dongGiaiThich = `${tenBeKia[0].toUpperCase()}${tenBeKia.slice(1)} đã xác nhận. Đang chờ bạn xác nhận để hoàn tất đơn.`;
  } else {
    dongGiaiThich = "Đơn chỉ hoàn thành khi cả thợ và khách cùng xác nhận.";
  }

  return (
    <div className="bg-paper border border-line rounded-xl p-3.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft mb-2.5">
        Xác nhận hoàn thành
      </p>
      <div className="flex items-start justify-center gap-2">
        <Buoc ten="Thợ" xong={thoXacNhan} laBan={vaiTro === "tho"} />
        <div
          className={`h-0.5 flex-1 max-w-[80px] mt-3 rounded ${
            thoXacNhan && khachXacNhan ? "bg-teal" : "bg-line"
          }`}
        />
        <Buoc ten="Khách" xong={khachXacNhan} laBan={vaiTro === "khach"} />
      </div>
      <p className="text-xs text-ink-soft text-center mt-2.5">{dongGiaiThich}</p>
    </div>
  );
}