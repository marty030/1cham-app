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
  const [dangDinhVi, setDangDinhVi] = useState(false);
  const [diaChiTuDinhVi, setDiaChiTuDinhVi] = useState("");

  useEffect(() => {
    async function layTinh() {
      const ketQua = await fetch("https://provinces.open-api.vn/api/v2/p/");
      const data = await ketQua.json();
      setDanhSachTinh(data);
    }
    layTinh();
  }, []);

  async function xuLyChonTinh(maTinh: string) {
    setDiaChiTuDinhVi("");
    setTinhDaChon(maTinh);
    setPhuongDaChon("");
    setDanhSachPhuong([]);
    if (!maTinh) return;
    const ketQua = await fetch(`https://provinces.open-api.vn/api/v2/p/${maTinh}?depth=2`);
    const data = await ketQua.json();
    setDanhSachPhuong(data.wards || []);
  }

  useEffect(() => {
    if (diaChiTuDinhVi) return; // đang dùng địa chỉ định vị tự động, không ghi đè
    const tenTinh = danhSachTinh.find((t) => t.code == tinhDaChon)?.name || "";
    const tenPhuong = danhSachPhuong.find((p) => p.code == phuongDaChon)?.name || "";
    const diaChiDayDu = [soNha, tenPhuong, tenTinh].filter(Boolean).join(", ");
    onDoiDiaChi(diaChiDayDu);
  }, [soNha, tinhDaChon, phuongDaChon]);

  async function dinhViHienTai() {
    if (!navigator.geolocation) {
      alert("Trình duyệt của bạn không hỗ trợ định vị.");
      return;
    }

    setDangDinhVi(true);

    navigator.geolocation.getCurrentPosition(
      async (viTri) => {
        try {
          const { latitude, longitude } = viTri.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await res.json();
          const diaChi = data?.display_name;

          if (!diaChi) {
            alert("Không xác định được địa chỉ từ vị trí hiện tại, vui lòng chọn thủ công.");
            setDangDinhVi(false);
            return;
          }

          setDiaChiTuDinhVi(diaChi);
          onDoiDiaChi(diaChi);
        } catch (err) {
          console.error("Lỗi định vị:", err);
          alert("Có lỗi khi xác định địa chỉ, vui lòng chọn thủ công.");
        } finally {
          setDangDinhVi(false);
        }
      },
      (loi) => {
        console.error("Lỗi lấy vị trí:", loi);
        alert("Không lấy được vị trí — kiểm tra đã bật quyền định vị cho trình duyệt chưa.");
        setDangDinhVi(false);
      }
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={dinhViHienTai}
        disabled={dangDinhVi}
        className="border border-teal text-teal bg-teal-soft hover:opacity-80 rounded-lg px-3 py-2 text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 transition"
      >
        📍 {dangDinhVi ? "Đang xác định vị trí..." : "Dùng vị trí hiện tại của bạn"}
      </button>

      {diaChiTuDinhVi && (
        <div className="bg-teal-soft border border-teal/20 rounded-lg px-3 py-2 text-xs text-teal">
          Đã dùng địa chỉ: {diaChiTuDinhVi}
        </div>
      )}

      <p className="text-xs text-ink-soft text-center">— hoặc nhập thủ công —</p>

      <select
        value={tinhDaChon}
        onChange={(e) => xuLyChonTinh(e.target.value)}
        className="border border-line rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-teal"
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
        onChange={(e) => {
          setDiaChiTuDinhVi("");
          setPhuongDaChon(e.target.value);
        }}
        disabled={!tinhDaChon}
        className="border border-line rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-teal disabled:bg-line"
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
        onChange={(e) => {
          setDiaChiTuDinhVi("");
          setSoNha(e.target.value);
        }}
        className="border border-line rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-teal"
      />
    </div>
  );
}