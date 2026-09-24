"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { ShieldCheck } from "lucide-react";
import { dichLoiSupabase } from "../../lib/dichLoi";
import { useThongBao } from "../../components/ThongBao";

export default function LoginAdmin() {
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [dangDangNhap, setDangDangNhap] = useState(false);
  const [loi, setLoi] = useState("");
  const router = useRouter();
  const thongBao = useThongBao();

  async function xuLyDangNhap() {
    setLoi("");

    if (!email.trim() || !matKhau) {
      setLoi("Vui lòng nhập đủ email và mật khẩu.");
      return;
    }

    setDangDangNhap(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: matKhau,
    });

    if (error) {
      setDangDangNhap(false);
      setLoi("Đăng nhập thất bại: " + dichLoiSupabase(error.message));
      return;
    }

    const role = data.user?.user_metadata?.role;
    if (role !== "admin") {
      await supabase.auth.signOut();
      setDangDangNhap(false);
      setLoi("Tài khoản này không có quyền admin.");
      return;
    }

    thongBao("Đăng nhập thành công!", "thanhcong");
    router.push("/admin/don-dat-lich");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-paper px-4">
      <div className="w-full max-w-sm bg-card border border-line rounded-2xl p-6 sm:p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-ink mb-6 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-teal" /> Đăng nhập Admin
        </h1>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Email</label>
            <input
              type="email"
              placeholder="admin@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && xuLyDangNhap()}
              className="w-full px-4 py-2.5 rounded-lg border border-line focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Mật khẩu</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu"
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && xuLyDangNhap()}
              className="w-full px-4 py-2.5 rounded-lg border border-line focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none transition-all"
            />
          </div>

          {loi && <p className="text-sm text-rust">{loi}</p>}

          <button
            className="bg-teal hover:opacity-90 transition text-white px-4 py-2.5 rounded-lg w-full font-semibold disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
            onClick={xuLyDangNhap}
            disabled={dangDangNhap}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{dangDangNhap ? "Đang đăng nhập..." : "Đăng nhập"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}