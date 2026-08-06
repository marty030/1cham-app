"use client";

type FormThemThoProps = {
  tenMoi: string;
  ngheMoi: string;
  diaChiMoi: string;
  onDoiTen: (giaTri: string) => void;
  onDoiNghe: (giaTri: string) => void;
  onDoiDiaChi: (giaTri: string) => void;
  onThem: () => void;
};

export default function FormThemTho({
  tenMoi,
  ngheMoi,
  diaChiMoi,
  onDoiTen,
  onDoiNghe,
  onDoiDiaChi,
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
        placeholder="Nghề"
        value={ngheMoi}
        onChange={(e) => onDoiNghe(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 mb-2 w-full"
      />
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