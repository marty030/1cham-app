"use client";
import { DANH_MUC_NGHE } from "../lib/danhMuc";

type FormThemThoProps = {
  tenMoi: string;
  ngheMoi: string;
  diaChiMoi: string;
  danhMucMoi: string[];
  onDoiTen: (giaTri: string) => void;
  onDoiNghe: (giaTri: string) => void;
  onDoiDiaChi: (giaTri: string) => void;
  onToggleDanhMuc: (giaTri: string) => void;
  onThem: () => void;
};

export default function FormThemTho({
  tenMoi,
  ngheMoi,
  diaChiMoi,
  danhMucMoi,
  onDoiTen,
  onDoiNghe,
  onDoiDiaChi,
  onToggleDanhMuc,
  onThem,
}: FormThemThoProps) {
  return (
    <div className="mt-10 border border-gray-300 rounded-xl p-4 w-72 bg-white">
      <h2 className="text-xl font-bold mb-3">Thêm thợ mới</h2>

      <input
        type="text"
        placeholder="Tên thợ"
        value={tenMoi}
        onChange={(e) => onDoiTen(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 mb-2 w-full"
      />
      <input
        type="text"
        placeholder="Nghề (mô tả chi tiết)"
        value={ngheMoi}
        onChange={(e) => onDoiNghe(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 mb-2 w-full"
      />

      <div className="mb-2">
        <p className="text-sm font-semibold text-gray-700 mb-1.5">Ngành nhận làm</p>
        <div className="flex flex-col gap-1.5 border border-gray-200 rounded-lg p-3 bg-gray-50">
          {DANH_MUC_NGHE.map((muc) => (
            <label key={muc.gia_tri} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={danhMucMoi.includes(muc.gia_tri)}
                onChange={() => onToggleDanhMuc(muc.gia_tri)}
                className="w-4 h-4 accent-blue-500"
              />
              {muc.nhan}
            </label>
          ))}
        </div>
      </div>

      <input
        type="text"
        placeholder="Địa chỉ"
        value={diaChiMoi}
        onChange={(e) => onDoiDiaChi(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 mb-2 w-full"
      />

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full"
        onClick={onThem}
      >
        Thêm thợ
      </button>
    </div>
  );
}