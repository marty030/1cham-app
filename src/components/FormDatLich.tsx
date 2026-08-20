"use client";

type FormDatLichProps = {
  hienForm: boolean;
  tenKhach: string;
  soDienThoai: string;
  ngayHen: string;
  gioHen: string;
  diaChiHen: string;
  ghiChu: string;
  onDoiTenKhach: (giaTri: string) => void;
  onDoiSoDienThoai: (giaTri: string) => void;
  onDoiNgayHen: (giaTri: string) => void;
  onDoiGioHen: (giaTri: string) => void;
  onDoiDiaChiHen: (giaTri: string) => void;
  onDoiGhiChu: (giaTri: string) => void;
  onXacNhan: () => void;
  onHuy: () => void;
};

export default function FormDatLich({
  hienForm,
  tenKhach,
  soDienThoai,
  ngayHen,
  gioHen,
  diaChiHen,
  ghiChu,
  onDoiTenKhach,
  onDoiSoDienThoai,
  onDoiNgayHen,
  onDoiGioHen,
  onDoiDiaChiHen,
  onDoiGhiChu,
  onXacNhan,
  onHuy,
}: FormDatLichProps) {
  if (!hienForm) return null;

  return (
    <div className="mt-2 border-t pt-2">
      <input
        type="text"
        placeholder="Tên của bạn"
        value={tenKhach}
        onChange={(e) => onDoiTenKhach(e.target.value)}
        className="border border-gray-300 rounded-lg px-2 py-1 text-sm w-full mb-1"
      />
      <input
        type="tel"
        placeholder="Số điện thoại"
        value={soDienThoai}
        onChange={(e) => onDoiSoDienThoai(e.target.value)}
        className="border border-gray-300 rounded-lg px-2 py-1 text-sm w-full mb-1"
      />
      <input
        type="date"
        value={ngayHen}
        onChange={(e) => onDoiNgayHen(e.target.value)}
        className="border border-gray-300 rounded-lg px-2 py-1 text-sm w-full mb-1"
      />
      <input
        type="time"
        value={gioHen}
        onChange={(e) => onDoiGioHen(e.target.value)}
        className="border border-gray-300 rounded-lg px-2 py-1 text-sm w-full mb-1"
      />
      <input
        type="text"
        placeholder="Địa chỉ cần sửa"
        value={diaChiHen}
        onChange={(e) => onDoiDiaChiHen(e.target.value)}
        className="border border-gray-300 rounded-lg px-2 py-1 text-sm w-full mb-1"
      />
      <textarea
        placeholder="Ghi chú (mô tả sự cố...)"
        value={ghiChu}
        onChange={(e) => onDoiGhiChu(e.target.value)}
        className="border border-gray-300 rounded-lg px-2 py-1 text-sm w-full mb-1"
        rows={2}
      />
      <div className="flex gap-2">
        <button className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm flex-1" onClick={onXacNhan}>
          Xác nhận
        </button>
        <button className="bg-gray-300 text-gray-700 px-3 py-1 rounded-lg text-sm flex-1" onClick={onHuy}>
          Hủy
        </button>
      </div>
    </div>
  );
}