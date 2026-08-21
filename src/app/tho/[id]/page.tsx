"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import FormDatLich from "../../../components/FormDatLich";

function tinhCapDo(soDon: number) {
  if (soDon >= 300) return { cap: 5, ten: "Bậc thầy", tiepTheo: null };
  if (soDon >= 150) return { cap: 4, ten: "Chuyên gia", tiepTheo: 300 };
  if (soDon >= 50) return { cap: 3, ten: "Thành thạo", tiepTheo: 150 };
  if (soDon >= 10) return { cap: 2, ten: "Có kinh nghiệm", tiepTheo: 50 };
  return { cap: 1, ten: "Mới bắt đầu", tiepTheo: 10 };
}

export default function ChiTietTho() {
  const params = useParams();
  const [tho, setTho] = useState<any>(null);
  const [dangTai, setDangTai] = useState(true);

  const [hienFormDatLich, setHienFormDatLich] = useState(false);
  const [tenKhach, setTenKhach] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [ngayHen, setNgayHen] = useState("");
  const [gioHen, setGioHen] = useState("");
  const [diaChiHen, setDiaChiHen] = useState("");
  const [ghiChu, setGhiChu] = useState("");

  useEffect(() => {
    async function layTho() {
      const { data, error } = await supabase
        .from("tho")
        .select("*")
        .eq("id", params.id)
        .single();
      if (error) {
        console.log("Lỗi:", error);
      } else {
        setTho(data);
      }
      setDangTai(false);
    }
    layTho();
  }, [params.id]);

  async function xacNhanDatLich() {
    const { error } = await supabase.from("don_dat_lich").insert([
      {
        ten_khach: tenKhach,
        so_dien_thoai: soDienThoai,
        tho_id: tho.id,
        gio_hen: `${ngayHen}T${gioHen}:00`,
        dia_chi_hen: diaChiHen,
        ghi_chu: ghiChu,
      },
    ]);
    if (error) {
      alert("Lỗi đặt lịch: " + error.message);
    } else {
      alert("Đặt lịch thành công! Thợ sẽ liên hệ bạn sớm.");
      setHienFormDatLich(false);
      setTenKhach("");
      setSoDienThoai("");
      setNgayHen("");
      setGioHen("");
      setDiaChiHen("");
      setGhiChu("");
    }
  }

  if (dangTai) return <p className="p-8">Đang tải...</p>;
  if (!tho) return <p className="p-8">Không tìm thấy thợ này.</p>;

  const soDon = tho.so_don_hoan_thanh || 0;
  const thongTinCap = tinhCapDo(soDon);
  const phanTramLenCap = thongTinCap.tiepTheo
    ? Math.min(100, (soDon / thongTinCap.tiepTheo) * 100)
    : 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold shrink-0">
            {tho.ten ? tho.ten.charAt(0).toUpperCase() : "T"}
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">{tho.ten}</h1>
            <p className="text-sm text-gray-500">{tho.nghe} · {tho.dia_chi}</p>
            {tho.dang_nghi ? (
              <span className="text-red-500 text-sm">🔴 Đang nghỉ</span>
            ) : (
              <span className="text-emerald-500 text-sm">🟢 Có thể nhận đơn ngay</span>
            )}
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1 text-sm font-medium mb-4">
          ⭐ Cấp {thongTinCap.cap} · {thongTinCap.ten}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-gray-800">{soDon}</p>
            <p className="text-xs text-gray-500">đơn hoàn thành</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-gray-800">{tho.danh_gia_sao ?? "—"}</p>
            <p className="text-xs text-gray-500">⭐ đánh giá</p>
          </div>
        </div>

        {thongTinCap.tiepTheo && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Cấp {thongTinCap.cap} · {thongTinCap.ten}</span>
              <span>{soDon} / {thongTinCap.tiepTheo} đơn để lên Cấp {thongTinCap.cap + 1}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all"
                style={{ width: `${phanTramLenCap}%` }}
              ></div>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 italic mb-4">
          * Hệ thống huy hiệu và chỉ số chi tiết đang được phát triển
        </p>

        <button
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition"
          onClick={() => setHienFormDatLich(true)}
        >
          📅 Đặt lịch với {tho.ten}
        </button>

        <FormDatLich
          hienForm={hienFormDatLich}
          tenKhach={tenKhach}
          soDienThoai={soDienThoai}
          ngayHen={ngayHen}
          gioHen={gioHen}
          diaChiHen={diaChiHen}
          ghiChu={ghiChu}
          onDoiTenKhach={setTenKhach}
          onDoiSoDienThoai={setSoDienThoai}
          onDoiNgayHen={setNgayHen}
          onDoiGioHen={setGioHen}
          onDoiDiaChiHen={setDiaChiHen}
          onDoiGhiChu={setGhiChu}
          onXacNhan={xacNhanDatLich}
          onHuy={() => setHienFormDatLich(false)}
        />
      </div>
    </div>
  );
}