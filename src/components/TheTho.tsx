"use client";

type TheThoProps = {
  tho: any;
  index: number;
  dangMo: boolean;
  dangSua: boolean;
  ngheSua: string;
  daDangNhap: boolean;
  onXemChiTiet: () => void;
  onBatDauSua: () => void;
  onDoiNgheSua: (giaTri: string) => void;
  onLuuSua: () => void;
  onXoa: () => void;
};

export default function TheTho({
  tho,
  dangMo,
  dangSua,
  ngheSua,
  daDangNhap,
  onXemChiTiet,
  onBatDauSua,
  onDoiNgheSua,
  onLuuSua,
  onXoa,
}: TheThoProps) {
  return (
    <div className="border border-gray-300 rounded-xl p-4 w-56 shadow bg-white">
      <h2 className="text-xl font-semibold">{tho.ten}</h2>
      <p className="text-gray-600">{tho.nghe}</p>

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
        onClick={() => alert("Đang gọi thợ: " + tho.ten)}
      >
        Gọi thợ ngay
      </button>

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