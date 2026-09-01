"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function HoSo() {
  const [hoSo, setHoSo] = useState<any>(null);
  const [dangTai, setDangTai] = useState(true);
  const [ten, setTen] = useState("");
  const [nghe, setNghe] = useState("");
  const [diaChi, setDiaChi] = useState("");
  const [banKinh, setBanKinh] = useState(10);
  const [dangLayViTri, setDangLayViTri] = useState(false);
  const router = useRouter();
  const [dangNghi, setDangNghi] = useState(false);

  useEffect(() => {
    async function layHoSo() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("tho")
        .select("*")
        .eq("user_id", sessionData.session.user.id)
        .single();

      if (error) {
        console.log("Lỗi:", error);
      } else {
        setHoSo(data);
        setTen(data.ten);
        setNghe(data.nghe);
        setDiaChi(data.dia_chi);
        setDangNghi(data.dang_nghi || false);
        setBanKinh(data.ban_kinh_hoat_dong ?? 10);
      }
      setDangTai(false);
    }
    layHoSo();
  }, []);

  async function luuHoSo() {
    const { error } = await supabase
      .from("tho")
      .update({ ten: ten, nghe: nghe, dia_chi: diaChi, ban_kinh_hoat_dong: banKinh })
      .eq("id", hoSo.id);

    if (error) {
      alert("Lỗi khi lưu: " + error.message);
    } else {
      alert("Cập nhật hồ sơ thành công!");
    }
  }

  async function doiTrangThaiNghi() {
    const trangThaiMoi = !dangNghi;
    const { error } = await supabase
      .from("tho")
      .update({ dang_nghi: trangThaiMoi })
      .eq("id", hoSo.id);

    if (error) {
      alert("Lỗi: " + error.message);
    } else {
      setDangNghi(trangThaiMoi);
    }
  }

  // MỚI: đặt tọa độ trung tâm khu vực hoạt động — lấy 1 lần, không theo dõi liên tục
  function datViTriTrungTam() {
    if (!("geolocation" in navigator)) {
      alert("Trình duyệt không hỗ trợ định vị.");
      return;
    }
    setDangLayViTri(true);
    navigator.geolocation.getCurrentPosition(
      async (viTri) => {
        const { error } = await supabase
          .from("tho")
          .update({ vi_do: viTri.coords.latitude, kinh_do: viTri.coords.longitude })
          .eq("id", hoSo.id);
        setDangLayViTri(false);
        if (error) {
          alert("Lỗi lưu vị trí: " + error.message);
        } else {
          alert("Đã đặt vị trí trung tâm khu vực hoạt động!");
        }
      },
      (loi) => {
        setDangLayViTri(false);
        alert("Không lấy được vị trí: " + loi.message);
      },
      { enableHighAccuracy: false, timeout: 20000 }
    );
  }

  if (dangTai) return <p className="p-8">Đang tải hồ sơ...</p>;
  if (!hoSo) return <p className="p-8">Không tìm thấy hồ sơ của bạn.</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="border border-gray-300 rounded-xl p-6 w-80 bg-white">
        <h1 className="text-xl font-bold mb-4">Hồ sơ của tôi</h1>

        <label className="text-sm text-gray-600">Tên</label>
        <input
          type="text"
          value={ten}
          onChange={(e) => setTen(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 mb-2 w-full"
        />

        <label className="text-sm text-gray-600">Nghề</label>
        <input
          type="text"
          value={nghe}
          onChange={(e) => setNghe(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 mb-2 w-full"
        />

        <label className="text-sm text-gray-600">Địa chỉ</label>
        <input
          type="text"
          value={diaChi}
          onChange={(e) => setDiaChi(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 mb-3 w-full"
        />

        {/* MỚI: KHU VỰC HOẠT ĐỘNG */}
        <div className="border border-gray-300 rounded-lg p-3 mb-3">
          <p className="text-sm font-semibold text-gray-700 mb-2">📍 Khu vực hoạt động</p>

          <label className="text-xs text-gray-500">Bán kính (km)</label>
          <input
            type="number"
            min={1}
            max={50}
            value={banKinh}
            onChange={(e) => setBanKinh(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 mb-2 w-full text-sm"
          />

          <button
            onClick={datViTriTrungTam}
            disabled={dangLayViTri}
            className="bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm w-full"
          >
            {dangLayViTri ? "Đang lấy vị trí..." : "📍 Đặt vị trí trung tâm (tại đây)"}
          </button>
          <p className="text-[11px] text-gray-400 mt-1">
            Bấm khi bạn đang đứng ở nơi làm việc chính (nhà/xưởng) để đặt tâm khu vực nhận khách.
          </p>
        </div>

        <p className="text-sm text-yellow-600 mb-3">
          ⭐ {hoSo.danh_gia_sao} · {hoSo.so_don_hoan_thanh} đơn hoàn thành
        </p>
        <div className="flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 mb-3">
          <span className="text-sm">
            {dangNghi ? "🔴 Đang nghỉ" : "🟢 Đang hoạt động"}
          </span>
          <button
            className={`px-3 py-1 rounded-lg text-sm text-white ${
              dangNghi ? "bg-green-500" : "bg-red-500"
            }`}
            onClick={doiTrangThaiNghi}
          >
            {dangNghi ? "Bật lại" : "Nghỉ tạm thời"}
          </button>
        </div>

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full"
          onClick={luuHoSo}
        >
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}