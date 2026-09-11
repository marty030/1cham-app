"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { timEmailTheoSoDienThoai } from "../../lib/dangNhapSdt";
import { LogIn } from "lucide-react";

function NoiDungDangNhap() {
  const [soDienThoai, setSoDienThoai] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [dangDangNhap, setDangDangNhap] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const duongDanTiepTheo = searchParams.get("next") || "/";

  async function xuLyDangNhap() {
    if (!soDienThoai.trim()) {
      alert("Vui lòng nhập số điện thoại.");
      return;
    }

    setDangDangNhap(true);

    const email = await timEmailTheoSoDienThoai(soDienThoai);
    if (!email) {
      setDangDangNhap(false);
      alert("Không tìm thấy tài khoản với số điện thoại này. Kiểm tra lại hoặc đăng ký mới.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: matKhau,
    });

    setDangDangNhap(false);

    if (error) {
      alert("Đăng nhập thất bại: " + error.message);
    } else {
      router.push(duongDanTiepTheo);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-paper">
      <div className="border border-line rounded-2xl p-6 w-80 bg-card shadow-sm">
        <h1 className="text-xl font-bold mb-4 text-ink">Đăng nhập</h1>
        <input
          type="tel"
          placeholder="Số điện thoại"
          value={soDienThoai}
          onChange={(e) => setSoDienThoai(e.target.value)}
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
          className="bg-teal hover:opacity-90 transition text-white px-4 py-2 rounded-lg w-full font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          onClick={xuLyDangNhap}
          disabled={dangDangNhap}
        >
          <LogIn className="w-4 h-4" />
          <span>{dangDangNhap ? "Đang đăng nhập..." : "Đăng nhập"}</span>
        </button>
        <p className="text-sm text-center mt-3 text-ink-soft">
          Chưa có tài khoản khách hàng?{" "}
          <a
            href={`/dang-ky-khach${duongDanTiepTheo !== "/" ? `?next=${encodeURIComponent(duongDanTiepTheo)}` : ""}`}
            className="text-teal underline"
          >
            Đăng ký ngay
          </a>
        </p>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-paper">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rust"></div>
        </div>
      }
    >
      <NoiDungDangNhap />
    </Suspense>
  );
}