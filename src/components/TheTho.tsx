"use client";
import { useRouter } from "next/navigation";
import FormDatLich from "./FormDatLich";
import { DANH_MUC_NGHE } from "../lib/danhMuc";

type TheThoProps = {
  tho: any;
  index: number;
  dangMo: boolean;
  dangSua: boolean;
  ngheSua: string;
  daDangNhap: boolean;
  dangLamViec: boolean;
  dangNghi: boolean;
  dangDatLich: boolean;
  tenKhach: string;
  soDienThoai: string;
  ngayHen: string;
  gioHen: string;
  diaChiHen: string;
  ghiChu: string;
  khoangCach: number | null;
  onXemChiTiet: () => void;
  onBatDauSua: () => void;
  onDoiNgheSua: (giaTri: string) => void;
  onLuuSua: () => void;
  onXoa: () => void;
  onMoDatLich: () => void;
  onDoiTenKhach: (giaTri: string) => void;
  onDoiSoDienThoai: (giaTri: string) => void;
  onDoiNgayHen: (giaTri: string) => void;
  onDoiGioHen: (giaTri: string) => void;
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
  daDangNhap,
  dangLamViec,
  dangNghi,
  dangDatLich,
  tenKhach,
  soDienThoai,
  ngayHen,
  gioHen,
  diaChiHen,
  ghiChu,
  khoangCach,
  onBatDauSua,
  onDoiNgheSua,
  onLuuSua,
  onXoa,
  onMoDatLich,
  onDoiTenKhach,
  onDoiSoDienThoai,
  onDoiNgayHen,
  onDoiGioHen,
  onDoiDiaChiHen,
  onDoiGhiChu,
  onXacNhanDatLich,
  onGoiNgay,
  onHuyDatLich,
}: TheThoProps) {
  const router = useRouter();
  const chuCaiDau = tho.ten ? tho.ten.charAt(0).toUpperCase() : "T";

  const tenCacDanhMuc: string[] = (tho.danh_muc || []).map(
    (ma: string) => DANH_MUC_NGHE.find((m) => m.gia_tri === ma)?.nhan ?? ma
  );

  return (
    <div
      className="bg-card border border-line rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col w-full h-full cursor-pointer"
      onClick={() => router.push(`/tho/${tho.id}`)}
    >

      {/* 1. HEADER */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-teal-soft text-teal flex items-center justify-center text-xl font-bold shrink-0">
          {chuCaiDau}
        </div>
        <div className="flex flex-col items-start gap-1.5 flex-1">
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
              💬
            </button>
          </div>

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

      {/* 2. BODY */}
      <div className="flex flex-col gap-2 mb-4 flex-1 text-sm">
        {tenCacDanhMuc.length > 0 ? (
          <p className="text-ink font-medium">{tenCacDanhMuc.join(" · ")}</p>
        ) : (
          <p className="text-ink-soft italic">Chưa cập nhật ngành</p>
        )}
        {tho.nghe && <p className="text-ink-soft text-xs">{tho.nghe}</p>}

        {tho.so_don_hoan_thanh > 0 ? (
          <p className="text-gold font-medium font-mono text-sm">
            ★ {tho.danh_gia_sao} <span className="text-ink-soft font-normal font-sans">· {tho.so_don_hoan_thanh} đơn</span>
          </p>
        ) : (
          <p className="text-ink-soft italic">Thợ mới — chưa có đánh giá</p>
        )}

        {khoangCach !== null && (
          <p className="text-xs text-teal font-medium font-mono">
            📍 Cách bạn {khoangCach.toFixed(1)} km
          </p>
        )}

        <div className="mt-2 p-3 bg-paper border border-line rounded-lg text-ink-soft text-sm flex items-start gap-2">
          <span className="shrink-0 text-ink-soft">📍</span>
          <span className="line-clamp-2 leading-relaxed">{tho.dia_chi}</span>
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
          <div className="flex gap-2">
            <button
              className="bg-teal hover:opacity-90 text-white px-3 py-1.5 rounded-md text-sm font-medium flex-1 transition"
              onClick={onLuuSua}
            >
              Lưu
            </button>
            <button
              className="bg-line hover:bg-ink-soft hover:text-white text-ink-soft px-3 py-1.5 rounded-md text-sm font-medium transition"
              onClick={onBatDauSua}
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
          📅 Đặt lịch
        </button>
      </div>

      {/* 5. KHU VỰC QUẢN LÝ DÀNH CHO ADMIN */}
      {daDangNhap && !dangSua && (
        <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
          <span className="text-xs text-ink-soft font-medium">Admin</span>
          <div className="flex gap-2">
            <button
              className="bg-teal-soft text-teal hover:opacity-80 px-3 py-1.5 rounded-md text-xs font-medium transition"
              onClick={(e) => {
                e.stopPropagation();
                onBatDauSua();
              }}
            >
              ✏️ Sửa
            </button>
            <button
              className="bg-rust-soft text-rust hover:opacity-80 px-3 py-1.5 rounded-md text-xs font-medium transition"
              onClick={(e) => {
                e.stopPropagation();
                onXoa();
              }}
            >
              🗑️ Ẩn/Xóa
            </button>
          </div>
        </div>
      )}

      {/* FORM ĐẶT LỊCH (Popup) */}
      <div onClick={(e) => e.stopPropagation()}>
        <FormDatLich
          hienForm={dangDatLich}
          tenKhach={tenKhach}
          soDienThoai={soDienThoai}
          ngayHen={ngayHen}
          gioHen={gioHen}
          diaChiHen={diaChiHen}
          ghiChu={ghiChu}
          onDoiTenKhach={onDoiTenKhach}
          onDoiSoDienThoai={onDoiSoDienThoai}
          onDoiNgayHen={onDoiNgayHen}
          onDoiGioHen={onDoiGioHen}
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
