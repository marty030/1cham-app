"use client";
import FormDatLich from "./FormDatLich";

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
  onHuyDatLich: () => void;
};

export default function TheTho({
  tho,
  dangMo,
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
  onXemChiTiet,
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
  onHuyDatLich,
}: TheThoProps) {
  return (
    <div className="border border-gray-300 rounded-xl p-4 w-56 shadow bg-white">
    
      <h2 className="text-xl font-semibold">{tho.ten}</h2>
{dangNghi ? (
  <span className="text-red-500 text-sm">🔴 Đang nghỉ</span>
) : dangLamViec ? (
  <span className="text-yellow-500 text-sm">🟡 Đang bận</span>
) : (
  <span className="text-green-500 text-sm">🟢 Sẵn sàng</span>
)}
      <p className="text-gray-600">{tho.nghe}</p>
    
{tho.so_don_hoan_thanh > 0 ? (
  <p className="text-sm text-yellow-600 mt-1">
    ⭐ {tho.danh_gia_sao} · {tho.so_don_hoan_thanh} đơn hoàn thành
  </p>
) : (
  <p className="text-sm text-gray-400 mt-1">Thợ mới — chưa có đánh giá</p>
)}

      {dangMo && (
        <p className="text-sm text-gray-500 mt-2">Địa chỉ: {tho.dia_chi}</p>
      )}

      <button
        className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg mt-2 text-sm"
        onClick={onXemChiTiet}
      >
        {dangMo ? "Ẩn chi tiết" : "Xem chi tiết"}
      </button>
<button
  className="bg-orange-500 text-white px-4 py-2 rounded-lg mt-3"
  onClick={onMoDatLich}
>
  Đặt lịch
</button>

{!dangNghi && !dangLamViec && (
  <button
    className="bg-red-600 text-white px-4 py-2 rounded-lg mt-2"
    onClick={() => alert("Đang gọi thợ... (demo)\nSố điện thoại: 0987xxxxxx")}
  >
    Gọi thợ ngay
  </button>
)}

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
  onHuy={onHuyDatLich}
/>



      {dangSua && (
        <div className="mt-2">
          <input
            type="text"
            value={ngheSua}
            onChange={(e) => onDoiNgheSua(e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-1 text-sm w-full mb-1"
          />
          <button
            className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm"
            onClick={onLuuSua}
          >
            Lưu
          </button>
        </div>
      )}
    {daDangNhap && (
  <>
      <button
        className="bg-red-500 text-white px-3 py-1 rounded-lg mt-2 text-sm"
        onClick={onXoa}
      >
        Xóa
      </button>

      <button
        className="bg-yellow-500 text-white px-3 py-1 rounded-lg mt-2 text-sm"
        onClick={onBatDauSua}
      >
        Sửa
      </button>
      </>
)}
    </div>
  );
}