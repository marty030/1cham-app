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
    <div className="mt-10 border border-line rounded-2xl p-4 w-72 bg-card">
      <h2 className="text-xl font-bold mb-3 text-ink">Thêm thợ mới</h2>

      <input
        type="text"
        placeholder="Tên thợ"
        value={tenMoi}
        onChange={(e) => onDoiTen(e.target.value)}
        className="border border-line rounded-lg px-3 py-2 mb-2 w-full outline-none focus:border-teal"
      />
      <input
        type="text"
        placeholder="Nghề (mô tả chi tiết)"
        value={ngheMoi}
        onChange={(e) => onDoiNghe(e.target.value)}
        className="border border-line rounded-lg px-3 py-2 mb-2 w-full outline-none focus:border-teal"
      />

      <div className="mb-2">
        <p className="text-sm font-semibold text-ink mb-1.5">Ngành nhận làm</p>
        <div className="flex flex-col gap-1.5 border border-line rounded-lg p-3 bg-paper">
          {DANH_MUC_NGHE.map((muc) => (
            <label key={muc.gia_tri} className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={danhMucMoi.includes(muc.gia_tri)}
                onChange={() => onToggleDanhMuc(muc.gia_tri)}
                className="w-4 h-4 accent-teal"
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
        className="border border-line rounded-lg px-3 py-2 mb-2 w-full outline-none focus:border-teal"
      />

      <button
        className="bg-teal hover:opacity-90 transition text-white px-4 py-2 rounded-lg w-full font-medium"
        onClick={onThem}
      >
        Thêm thợ
      </button>
    </div>
  );
}