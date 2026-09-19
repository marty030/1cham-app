"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { timEmailTheoSoDienThoai, sdtHopLe } from "../../lib/dangNhapSdt";
import { LogIn } from "lucide-react";
import TruongMatKhau from "../../components/TruongMatKhau";

function NoiDungDangNhap() {
  const [soDienThoai, setSoDienThoai] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [dangDangNhap, setDangDangNhap] = useState(false);
  const [daChamSdt, setDaChamSdt] = useState(false);
  const [daChamMatKhau, setDaChamMatKhau] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const duongDanTiepTheo = searchParams.get("next") || "/";

  const sdtLoi = daChamSdt && !sdtHopLe(soDienThoai);
  const matKhauLoi = daChamMatKhau && !matKhau;

  async function xuLyDangNhap() {
    setDaChamSdt(true);
    setDaChamMatKhau(true);

    if (!sdtHopLe(soDienThoai)) {
      alert("Vui lòng nhập đúng số điện thoại (10 số, bắt đầu bằng 0).");
      return;
    }
    if (!matKhau) {
      alert("Vui lòng nhập mật khẩu.");
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-paper px-4">
      <div className="w-full max-w-sm bg-card border border-line rounded-2xl p-6 sm:p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-ink mb-6 flex items-center gap-2">
          <LogIn className="w-6 h-6 text-teal" /> Đăng nhập
        </h1>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Số điện thoại <span className="text-rust">*</span>
            </label>
            <input
              type="tel"
              placeholder="09xx xxx xxx"
              value={soDienThoai}
              onChange={(e) => setSoDienThoai(e.target.value)}
              onBlur={() => setDaChamSdt(true)}
              className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 outline-none transition-all ${
                sdtLoi
                  ? "border-rust focus:ring-rust/30 focus:border-rust"
                  : "border-line focus:ring-teal/30 focus:border-teal"
              }`}
            />
            {sdtLoi && (
              <p className="text-xs text-rust mt-1">Số điện thoại cần đủ 10 số, bắt đầu bằng 0.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Mật khẩu <span className="text-rust">*</span>
            </label>
            <TruongMatKhau
              value={matKhau}
              onChange={setMatKhau}
              onBlur={() => setDaChamMatKhau(true)}
              placeholder="Nhập mật khẩu"
              loi={matKhauLoi}
            />
            {matKhauLoi && <p className="text-xs text-rust mt-1">Vui lòng nhập mật khẩu.</p>}
          </div>

          <button
            className="bg-teal hover:opacity-90 transition text-white px-4 py-2.5 rounded-lg w-full font-semibold disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
            onClick={xuLyDangNhap}
            disabled={dangDangNhap}
          >
            <LogIn className="w-4 h-4" />
            <span>{dangDangNhap ? "Đang đăng nhập..." : "Đăng nhập"}</span>
          </button>
        </div>

        <p className="text-sm text-center mt-5 text-ink-soft">
          Chưa có tài khoản khách hàng?{" "}
          <a
            href={`/dang-ky-khach${duongDanTiepTheo !== "/" ? `?next=${encodeURIComponent(duongDanTiepTheo)}` : ""}`}
            className="text-teal font-semibold underline"
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