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
    <div className="flex flex-col items-center justify-center min-h-screen bg-paper">
      <div className="border border-line rounded-2xl p-6 w-80 bg-card shadow-sm">
        <h1 className="text-xl font-bold mb-4 text-ink">Đăng ký tài khoản khách hàng</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-line rounded-lg px-3 py-2 mb-2 w-full outline-none focus:border-teal"
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={matKhau}
          onChange={(e) => setMatKhau(e.target.value)}
          className="border border-line rounded-lg px-3 py-2 mb-2 w-full outline-none focus:border-teal"
        />
        <input
          type="text"
          placeholder="Tên của bạn"
          value={tenKhach}
          onChange={(e) => setTenKhach(e.target.value)}
          className="border border-line rounded-lg px-3 py-2 mb-2 w-full outline-none focus:border-teal"
        />
        <input
          type="text"
          placeholder="Số điện thoại"
          value={soDienThoai}
          onChange={(e) => setSoDienThoai(e.target.value)}
          className="border border-line rounded-lg px-3 py-2 mb-3 w-full outline-none focus:border-teal"
        />
        <button
          className="bg-teal hover:opacity-90 transition text-white px-4 py-2 rounded-lg w-full font-medium"
          onClick={xuLyDangKy}
        >
          Đăng ký
        </button>
        <p className="text-sm text-center mt-3 text-ink-soft">
          Đã có tài khoản?{" "}
          <a href="/login" className="text-teal underline">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
}