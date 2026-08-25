"use client";
import { useState, useEffect } from "react";

type ChonDiaChiProps = {
  onDoiDiaChi: (diaChi: string) => void;
};

export default function ChonDiaChi({ onDoiDiaChi }: ChonDiaChiProps) {
  const [danhSachTinh, setDanhSachTinh] = useState<any[]>([]);
  const [danhSachPhuong, setDanhSachPhuong] = useState<any[]>([]);
  const [tinhDaChon, setTinhDaChon] = useState("");
  const [phuongDaChon, setPhuongDaChon] = useState("");
  const [soNha, setSoNha] = useState("");

  useEffect(() => {
    async function layTinh() {
      const ketQua = await fetch("https://provinces.open-api.vn/api/v2/p/");
      const data = await ketQua.json();
      setDanhSachTinh(data);
    }
    layTinh();
  }, []);

  async function xuLyChonTinh(maTinh: string) {
    setTinhDaChon(maTinh);
    setPhuongDaChon("");
    setDanhSachPhuong([]);
    if (!maTinh) return;
    const ketQua = await fetch(`https://provinces.open-api.vn/api/v2/p/${maTinh}?depth=2`);
    const data = await ketQua.json();
    setDanhSachPhuong(data.wards || []);
  }

  useEffect(() => {
    const tenTinh = danhSachTinh.find((t) => t.code == tinhDaChon)?.name || "";
    const tenPhuong = danhSachPhuong.find((p) => p.code == phuongDaChon)?.name || "";
    const diaChiDayDu = [soNha, tenPhuong, tenTinh].filter(Boolean).join(", ");
    onDoiDiaChi(diaChiDayDu);
  }, [soNha, tinhDaChon, phuongDaChon]);

  return (
    <div className="flex flex-col gap-2">
      <select
        value={tinhDaChon}
        onChange={(e) => xuLyChonTinh(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
      >
        <option value="">-- Chọn Tỉnh/Thành phố --</option>
        {danhSachTinh.map((tinh) => (
          <option key={tinh.code} value={tinh.code}>
            {tinh.name}
          </option>
        ))}
      </select>

      <select
        value={phuongDaChon}
        onChange={(e) => setPhuongDaChon(e.target.value)}
        disabled={!tinhDaChon}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full disabled:bg-gray-100"
      >
        <option value="">-- Chọn Phường/Xã --</option>
        {danhSachPhuong.map((phuong) => (
          <option key={phuong.code} value={phuong.code}>
            {phuong.name}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Số nhà, tên đường..."
        value={soNha}
        onChange={(e) => setSoNha(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
      />
    </div>
  );
}