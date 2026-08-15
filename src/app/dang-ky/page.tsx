"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function DangKy() {
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [tenTho, setTenTho] = useState("");
  const [ngheTho, setNgheTho] = useState("");
  const [diaChiTho, setDiaChiTho] = useState("");
  const router = useRouter();

  async function xuLyDangKy() {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: matKhau,
    });

    if (error) {
      alert("Đăng ký thất bại: " + error.message);
      return;
    }

    const userId = data.user?.id;

    const { error: loiTaoHoSo } = await supabase.from("tho").insert([
      {
        ten: tenTho,
        nghe: ngheTho,
        dia_chi: diaChiTho,
        user_id: userId,
        so_don_hoan_thanh: 0,
        danh_gia_sao: 0,
      },
    ]);

    if (loiTaoHoSo) {
      alert("Lỗi tạo hồ sơ: " + loiTaoHoSo.message);
    } else {
      alert("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận (nếu có).");
      router.push("/login");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="border border-gray-300 rounded-xl p-6 w-80 bg-white">
        <h1 className="text-xl font-bold mb-4">Đăng ký làm thợ</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 mb-2 w-full"
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={matKhau}
          onChange={(e) => setMatKhau(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 mb-2 w-full"
        />
        <input
          type="text"
          placeholder="Tên của bạn"
          value={tenTho}
          onChange={(e) => setTenTho(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 mb-2 w-full"
        />
        <input
          type="text"
          placeholder="Nghề"
          value={ngheTho}
          onChange={(e) => setNgheTho(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 mb-2 w-full"
        />
        <input
          type="text"
          placeholder="Địa chỉ"
          value={diaChiTho}
          onChange={(e) => setDiaChiTho(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 mb-3 w-full"
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full"
          onClick={xuLyDangKy}
        >
          Đăng ký
        </button>
      </div>
    </div>
  );
}