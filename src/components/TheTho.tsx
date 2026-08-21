"use client";
import FormDatLich from "./FormDatLich";

type TheThoProps = {
  tho: any;
  index: number;
  dangMo: boolean; // Bạn có thể xóa prop này ở file page.tsx sau này
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
  onXemChiTiet: () => void; // Có thể xóa prop này ở file page.tsx
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
  // Trích xuất chữ cái đầu của tên làm Avatar
  const chuCaiDau = tho.ten ? tho.ten.charAt(0).toUpperCase() : "T";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col w-full h-full">
      
      {/* 1. HEADER: Avatar, Tên và Trạng thái */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold shrink-0">
          {chuCaiDau}
        </div>
        <div className="flex flex-col items-start gap-1.5">
          <h2 className="text-lg font-bold text-gray-800 leading-tight line-clamp-1">{tho.ten}</h2>
          
          {dangNghi ? (
            <span className="bg-red-50 text-red-600 border border-red-200 text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Đang nghỉ
            </span>
          ) : dangLamViec ? (
            <span className="bg-yellow-50 text-yellow-600 border border-yellow-200 text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> Đang bận
            </span>
          ) : (
            <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Sẵn sàng
            </span>
          )}
        </div>
      </div>

      {/* 2. BODY: Thông tin nghề nghiệp, Đánh giá và ĐỊA CHỈ */}
      <div className="flex flex-col gap-2 mb-4 flex-1 text-sm">
        <p className="text-gray-700 font-medium">{tho.nghe}</p>
        
        {tho.so_don_hoan_thanh > 0 ? (
          <p className="text-yellow-600 font-medium">
            ⭐ {tho.danh_gia_sao} <span className="text-gray-400 font-normal">· {tho.so_don_hoan_thanh} đơn</span>
          </p>
        ) : (
          <p className="text-gray-400 italic">Thợ mới — chưa có đánh giá</p>
        )}

        {/* Địa chỉ luôn hiển thị rõ ràng */}
        <div className="mt-2 p-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-600 text-sm flex items-start gap-2">
          <span className="shrink-0 text-gray-400">📍</span>
          <span className="line-clamp-2 leading-relaxed">{tho.dia_chi}</span>
        </div>
      </div>

      {/* 3. KHU VỰC CHỈNH SỬA CHO ADMIN */}
      {dangSua && (
        <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100 flex flex-col gap-2">
          <input
            type="text"
            value={ngheSua}
            onChange={(e) => onDoiNgheSua(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full outline-none focus:border-yellow-500 bg-white"
            placeholder="Sửa nghề nghiệp..."
          />
          <div className="flex gap-2">
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md text-sm font-medium flex-1 transition"
              onClick={onLuuSua}
            >
              Lưu
            </button>
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium transition"
              onClick={onBatDauSua}
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* 4. FOOTER: Nhóm nút hành động chính của khách (Căn đáy) */}
      <div className="flex gap-2 mt-auto pt-2">
        <button
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg text-sm font-semibold transition shadow-sm flex items-center justify-center gap-1.5"
          onClick={onMoDatLich}
        >
          📅 Đặt lịch
        </button>
        
        {!dangNghi && !dangLamViec && (
          <button
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold transition shadow-sm flex items-center justify-center gap-1.5"
            onClick={() => alert("Đang gọi thợ... (demo)\nSố điện thoại: 0987xxxxxx")}
          >
            📞 Gọi ngay
          </button>
        )}
      </div>

      {/* 5. KHU VỰC QUẢN LÝ DÀNH CHO ADMIN */}
      {daDangNhap && !dangSua && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium">Admin</span>
          <div className="flex gap-2">
            <button
              className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-md text-xs font-medium transition"
              onClick={onBatDauSua}
            >
              ✏️ Sửa
            </button>
            <button
              className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md text-xs font-medium transition"
              onClick={onXoa}
            >
              🗑️ Ẩn/Xóa
            </button>
          </div>
        </div>
      )}

      {/* COMPONENT FORM ĐẶT LỊCH (Đã là Popup) */}
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
    </div>
  );
}