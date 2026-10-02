"use client";
import { useRouter } from "next/navigation";
import FormDatLich from "./FormDatLich";
import { DANH_MUC_NGHE } from "../lib/danhMuc";
import { MessageCircle, CalendarDays, Pencil, Trash2, MapPin, Navigation, Star } from "lucide-react";

type TheThoProps = {
  tho: any;
  index: number;
  dangMo: boolean;
  dangSua: boolean;
  ngheSua: string;
  danhMucSua: string[];
  daDangNhap: boolean;
  dangLamViec: boolean;
  dangNghi: boolean;
  dangDatLich: boolean;
  tenKhach: string;
  soDienThoai: string;
  gioHenDayDu: string;
  diaChiHen: string;
  ghiChu: string;
  khoangCach: number | null;
  onXemChiTiet: () => void;
    onBatDauSua: () => void;
  onHuySua: () => void;
  onDoiNgheSua: (giaTri: string) => void;
  onToggleDanhMucSua: (giaTri: string) => void;
  onLuuSua: () => void;
  onXoa: () => void;
  onMoDatLich: () => void;
  onDoiTenKhach: (giaTri: string) => void;
  onDoiSoDienThoai: (giaTri: string) => void;
  onDoiGioHenDayDu: (giaTri: string) => void;
  onDoiDiaChiHen: (giaTri: string) => void;
  onDoiGhiChu: (giaTri: string) => void;
  onXacNhanDatLich: () => void;
  onGoiNgay: () => void;
  onHuyDatLich: () => void;
};

export default function TheTho({
  tho,
  dangSua,
  ngheSua,
  danhMucSua,
  daDangNhap,
  dangLamViec,
  dangNghi,
  dangDatLich,
  tenKhach,
  soDienThoai,
  gioHenDayDu,
  diaChiHen,
  ghiChu,
  khoangCach,
    onBatDauSua,
  onHuySua,
  onDoiNgheSua,
  onToggleDanhMucSua,
  onLuuSua,
  onXoa,
  onMoDatLich,
  onDoiTenKhach,
  onDoiSoDienThoai,
  onDoiGioHenDayDu,
  onDoiDiaChiHen,
  onDoiGhiChu,
  onXacNhanDatLich,
  onGoiNgay,
  onHuyDatLich,
}: TheThoProps) {
  const router = useRouter();
  const chuCaiDau = tho.ten ? tho.ten.charAt(0).toUpperCase() : "T";

  // Nhãn ngành để quét nhanh. Bỏ "Khác": nó chẳng nói gì về thợ — phần mô tả công việc
  // mới là thứ nói thợ làm gì, nên với thợ "Khác" mô tả sẽ thành dòng chính.
  const tenCacDanhMuc: string[] = (tho.danh_muc || [])
    .filter((ma: string) => ma !== "khac")
    .map((ma: string) => DANH_MUC_NGHE.find((m) => m.gia_tri === ma)?.nhan ?? ma);

  // Thợ hay gõ "a,b,c" không có dấu cách sau phẩy → chuẩn hóa cho dễ đọc
  const moTa: string = (tho.nghe || "").trim().replace(/\s*,\s*/g, ", ");
  // Dòng chính: mô tả thợ tự viết; chưa viết thì dùng tên ngành; không có gì thì báo chưa cập nhật
  const dongChinh = moTa || tenCacDanhMuc.join(" · ");
  // Chỉ hiện nhãn ngành riêng khi dòng chính đang là mô tả (tránh lặp lại cùng một nội dung)
  const hienNhanNganh = moTa !== "" && tenCacDanhMuc.length > 0;

  return (
    <div
      className="bg-card border border-line rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col w-full h-full cursor-pointer"
      onClick={() => router.push(`/tho/${tho.id}`)}
    >

      {/* 1. HEADER: tên → uy tín (sao, số đơn) → trạng thái */}
      <div className="flex items-start gap-3.5 mb-4">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-teal-soft text-teal flex items-center justify-center text-2xl font-bold shrink-0">
          {tho.anh_dai_dien ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tho.anh_dai_dien} alt={tho.ten} className="w-full h-full object-cover" />
          ) : (
            chuCaiDau
          )}
        </div>
        <div className="flex flex-col items-start gap-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 w-full">
            <h2 className="text-lg font-bold text-ink leading-tight line-clamp-1">{tho.ten}</h2>
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/chat/${tho.id}`);
              }}
              className="text-teal hover:text-ink bg-teal-soft hover:bg-line rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs transition"
              title="Chat với thợ"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {tho.so_don_hoan_thanh > 0 ? (
              <p className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-gold text-gold" />
                <span className="text-base font-bold text-ink tabular-nums">{tho.danh_gia_sao}</span>
                <span className="text-xs text-ink-soft">· {tho.so_don_hoan_thanh} đơn</span>
              </p>
            ) : (
              <span className="text-xs font-semibold text-gold bg-gold-soft px-2 py-0.5 rounded-full">
                Thợ mới
              </span>
            )}

            {dangNghi ? (
              <span className="bg-rust-soft text-rust border border-rust/20 text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rust"></span> Đang nghỉ
              </span>
            ) : dangLamViec ? (
              <span className="bg-gold-soft text-gold border border-gold/20 text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gold"></span> Đang bận
              </span>
            ) : (
              <span className="bg-teal-soft text-teal border border-teal/20 text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse"></span> Sẵn sàng
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. BODY: thợ làm gì (chính) → ở đâu / cách bao xa (phụ, dồn sát nút Đặt lịch) */}
      <div className="flex flex-col gap-2.5 mb-4 flex-1">
        {hienNhanNganh && (
          <div className="flex flex-wrap gap-1.5">
            {tenCacDanhMuc.map((ten) => (
              <span
                key={ten}
                className="text-[11px] font-semibold uppercase tracking-wide text-teal bg-teal-soft px-2 py-0.5 rounded-md"
              >
                {ten}
              </span>
            ))}
          </div>
        )}

        {dongChinh ? (
          <p className="text-[15px] font-semibold text-ink leading-snug line-clamp-3">{dongChinh}</p>
        ) : (
          <p className="text-sm text-ink-soft italic">Thợ chưa cập nhật mô tả công việc</p>
        )}

        <div className="mt-auto pt-3 border-t border-line flex flex-col gap-1.5">
          {khoangCach !== null && (
            <p className="text-sm font-semibold text-teal flex items-center gap-1.5">
              <Navigation className="w-4 h-4 shrink-0" />
              <span>
                Cách bạn <span className="font-bold tabular-nums">{khoangCach.toFixed(1)} km</span>
              </span>
            </p>
          )}
          {tho.dia_chi && (
            <p className="text-xs text-ink-soft flex items-start gap-1.5 leading-relaxed">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{tho.dia_chi}</span>
            </p>
          )}
        </div>
      </div>

      {/* 3. KHU VỰC CHỈNH SỬA CHO ADMIN */}
      {dangSua && (
        <div
          className="mb-4 p-3 bg-gold-soft rounded-lg border border-gold/20 flex flex-col gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            value={ngheSua}
            onChange={(e) => onDoiNgheSua(e.target.value)}
            className="border border-line rounded-md px-3 py-1.5 text-sm w-full outline-none focus:border-gold bg-card"
            placeholder="Sửa nghề nghiệp..."
          />
          <div className="flex flex-col gap-1.5 border border-line rounded-md p-2.5 bg-card">
            <p className="text-xs font-semibold text-ink-soft">Ngành nhận làm</p>
            {DANH_MUC_NGHE.map((muc) => (
              <label key={muc.gia_tri} className="flex items-center gap-2 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={danhMucSua.includes(muc.gia_tri)}
                  onChange={() => onToggleDanhMucSua(muc.gia_tri)}
                  className="w-4 h-4 accent-gold"
                />
                {muc.nhan}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              className="bg-teal hover:opacity-90 text-white px-3 py-1.5 rounded-md text-sm font-medium flex-1 transition"
              onClick={onLuuSua}
            >
              Lưu
            </button>
                        <button
              className="bg-line hover:bg-ink-soft hover:text-white text-ink-soft px-3 py-1.5 rounded-md text-sm font-medium transition"
              onClick={onHuySua}
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* 4. FOOTER — chỉ còn đúng 1 nút CTA chính */}
      <div className="flex gap-2 mt-auto pt-2">
        <button
          className="flex-1 bg-rust hover:opacity-90 text-white py-2.5 rounded-lg text-sm font-semibold transition shadow-sm flex items-center justify-center gap-1.5"
          onClick={(e) => {
            e.stopPropagation();
            onMoDatLich();
          }}
        >
          <CalendarDays className="w-4 h-4" /> Đặt lịch
        </button>
      </div>

      {/* 5. KHU VỰC QUẢN LÝ DÀNH CHO ADMIN */}
      {daDangNhap && !dangSua && (
        <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
          <span className="text-xs text-ink-soft font-medium">Admin</span>
          <div className="flex gap-2">
            <button
              className="bg-teal-soft text-teal hover:opacity-80 px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                onBatDauSua();
              }}
            >
              <Pencil className="w-3.5 h-3.5" /> Sửa
            </button>
            <button
              className="bg-rust-soft text-rust hover:opacity-80 px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                onXoa();
              }}
            >
              <Trash2 className="w-3.5 h-3.5" /> Ẩn/Xóa
            </button>
          </div>
        </div>
      )}

      {/* FORM ĐẶT LỊCH (Popup) */}
      <div onClick={(e) => e.stopPropagation()}>
        <FormDatLich
          hienForm={dangDatLich}
          thoId={tho.id}
          tenKhach={tenKhach}
          soDienThoai={soDienThoai}
          gioHenDayDu={gioHenDayDu}
          diaChiHen={diaChiHen}
          ghiChu={ghiChu}
          onDoiTenKhach={onDoiTenKhach}
          onDoiSoDienThoai={onDoiSoDienThoai}
          onDoiGioHenDayDu={onDoiGioHenDayDu}
          onDoiDiaChiHen={onDoiDiaChiHen}
          onDoiGhiChu={onDoiGhiChu}
          onXacNhan={onXacNhanDatLich}
          onGoiNgay={onGoiNgay}
          onHuy={onHuyDatLich}
        />
      </div>
    </div>
  );
}