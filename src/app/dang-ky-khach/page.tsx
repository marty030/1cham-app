"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function DangKyKhach() {
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [tenKhach, setTenKhach] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const router = useRouter();

  async function xuLyDangKy() {
    // 1. Tạo tài khoản Supabase Auth, gắn role "khach" vào metadata
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: matKhau,
      options: {
        data: { role: "khach" },
      },
    });

    if (error) {
      alert("Đăng ký thất bại: " + error.message);
      return;
    }

    const userId = data.user?.id;

    // 2. Tạo hồ sơ khách trong bảng "khach" (KHÔNG đụng vào bảng "tho")
    const { error: loiTaoHoSo } = await supabase.from("khach").insert([
      {
        user_id: userId,
        ten: tenKhach,
        so_dien_thoai: soDienThoai,
      },
    ]);

    if (loiTaoHoSo) {
      alert("Lỗi tạo hồ sơ khách: " + loiTaoHoSo.message);
    } else {
      alert("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận (nếu có).");
      router.push("/login");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="border border-gray-300 rounded-xl p-6 w-80 bg-white">
        <h1 className="text-xl font-bold mb-4">Đăng ký tài khoản khách hàng</h1>
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
          value={tenKhach}
          onChange={(e) => setTenKhach(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 mb-2 w-full"
        />
        <input
          type="text"
          placeholder="Số điện thoại"
          value={soDienThoai}
          onChange={(e) => setSoDienThoai(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 mb-3 w-full"
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full"
          onClick={xuLyDangKy}
        >
          Đăng ký
        </button>
        <p className="text-sm text-center mt-3">
          Đã có tài khoản?{" "}
          <a href="/login" className="text-blue-500 underline">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
}
