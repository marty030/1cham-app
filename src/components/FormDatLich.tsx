"use client";

type FormDatLichProps = {
  hienForm: boolean;
  tenKhach: string;
  soDienThoai: string;
  onDoiTenKhach: (giaTri: string) => void;
  onDoiSoDienThoai: (giaTri: string) => void;
  onXacNhan: () => void;
  onHuy: () => void;
};

export default function FormDatLich({
  hienForm,
  tenKhach,
  soDienThoai,
  onDoiTenKhach,
  onDoiSoDienThoai,
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
      <div className="flex gap-2">
        <button
          className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm flex-1"
          onClick={onXacNhan}
        >
          Xác nhận
        </button>
        <button
          className="bg-gray-300 text-gray-700 px-3 py-1 rounded-lg text-sm flex-1"
          onClick={onHuy}
        >
          Hủy
        </button>
      </div>
    </div>
  );
}