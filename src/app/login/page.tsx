"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const router = useRouter();

  async function xuLyDangNhap() {
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: matKhau,
    });

    if (error) {
      alert("Đăng nhập thất bại: " + error.message);
    } else {
      alert("Đăng nhập thành công!");
      router.push("/");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="border border-gray-300 rounded-xl p-6 w-80 bg-white">
        <h1 className="text-xl font-bold mb-4">Đăng nhập Admin</h1>
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
          className="border border-gray-300 rounded-lg px-3 py-2 mb-3 w-full"
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full"
          onClick={xuLyDangNhap}
        >
          Đăng nhập
        </button>
      </div>
    </div>
  );
}