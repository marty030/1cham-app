"use client";
import { useState } from "react";
import ChonDiaChi from "./ChonDiaChi";

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
  onGoiNgay: () => void;
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
  onGoiNgay,
  onHuy,
}: FormDatLichProps) {
  const [cheDo, setCheDo] = useState<"ngay_bay_gio" | "gio_khac">("ngay_bay_gio");

  if (!hienForm) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">

        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 text-orange-500"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-800">Thông tin đặt lịch</h3>
          </div>
          <button
            onClick={onHuy}
            className="text-gray-400 hover:text-red-500 bg-white hover:bg-red-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex flex-col gap-4">

          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setCheDo("ngay_bay_gio")}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${
                cheDo === "ngay_bay_gio" ? "bg-white shadow text-orange-600" : "text-gray-500"
              }`}
            >
              ⚡ Ngay bây giờ
            </button>
            <button
              type="button"
              onClick={() => setCheDo("gio_khac")}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${
                cheDo === "gio_khac" ? "bg-white shadow text-orange-600" : "text-gray-500"
              }`}
            >
              🗓️ Chọn giờ khác
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Họ và tên <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="Nhập tên của bạn"
              value={tenKhach}
              onChange={(e) => onDoiTenKhach(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số điện thoại <span className="text-red-500">*</span></label>
            <input
              type="tel"
              placeholder="09xx xxx xxx"
              value={soDienThoai}
              onChange={(e) => onDoiSoDienThoai(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
            />
          </div>

          {cheDo === "gio_khac" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ngày hẹn <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={ngayHen}
                  onChange={(e) => onDoiNgayHen(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Giờ hẹn <span className="text-red-500">*</span></label>
                <input
                  type="time"
                  value={gioHen}
                  onChange={(e) => onDoiGioHen(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Địa chỉ sửa chữa <span className="text-red-500">*</span></label>
            <ChonDiaChi onDoiDiaChi={onDoiDiaChiHen} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả sự cố-Ghi chú đến thợ (không bắt buộc)</label>
            <textarea
              placeholder="Mô tả qua tình trạng hư hỏng để thợ chuẩn bị đồ nghề-Lưu ý cho thợ khi tới nơi..."
              value={ghiChu}
              onChange={(e) => onDoiGhiChu(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 bg-gray-50">
          <button
            onClick={onHuy}
            className="flex-1 bg-white border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Hủy bỏ
          </button>
          {cheDo === "ngay_bay_gio" ? (
            <button
              onClick={onGoiNgay}
              className="flex-1 bg-emerald-500 text-white font-semibold py-2.5 rounded-lg hover:bg-emerald-600 transition-colors shadow-md active:scale-[0.98]"
            >
              📞 Gọi ngay
            </button>
          ) : (
            <button
              onClick={onXacNhan}
              className="flex-1 bg-orange-500 text-white font-semibold py-2.5 rounded-lg hover:bg-orange-600 transition-colors shadow-md active:scale-[0.98]"
            >
              Xác nhận đặt
            </button>
          )}
        </div>

      </div>
    </div>
  );
}