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
    <div className="flex flex-col items-center justify-center min-h-screen bg-paper">
      <div className="border border-line rounded-2xl p-6 w-80 bg-card shadow-sm">
        <h1 className="text-xl font-bold mb-4 text-ink">Đăng nhập
        </h1>
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
          className="border border-line rounded-lg px-3 py-2 mb-3 w-full outline-none focus:border-teal"
        />
        <button
          className="bg-teal hover:opacity-90 transition text-white px-4 py-2 rounded-lg w-full font-medium"
          onClick={xuLyDangNhap}
        >
          Đăng nhập
        </button>
      </div>
    </div>
  );
}