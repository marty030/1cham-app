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
      }
      setDangTai(false);
    }
    layHoSo();
  }, []);

  async function luuHoSo() {
    const { error } = await supabase
      .from("tho")
      .update({ ten: ten, nghe: nghe, dia_chi: diaChi })
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