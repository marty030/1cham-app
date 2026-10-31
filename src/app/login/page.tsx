"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { timEmailDangNhap, sdtHopLe } from "../../lib/dangNhapSdt";
import { LogIn } from "lucide-react";
import TruongMatKhau from "../../components/TruongMatKhau";
import { useThongBao } from "../../components/ThongBao";
import { dichLoiSupabase } from "../../lib/dichLoi";

function NoiDungDangNhap() {
  const [soDienThoai, setSoDienThoai] = useState("");
  const [matKhau, setMatKhau] = useState("");
  // Tài khoản cũ đăng ký bằng email thật: chủ động chuyển sang đăng nhập bằng email.
  // Luôn hiển thị lựa chọn này cho MỌI người (không tự phát hiện theo số điện thoại)
  // để không làm lộ số nào đã đăng ký.
  const [dungEmail, setDungEmail] = useState(false);
  const [emailNhap, setEmailNhap] = useState("");
  const [dangDangNhap, setDangDangNhap] = useState(false);
  const [daChamSdt, setDaChamSdt] = useState(false);
  const [daChamEmail, setDaChamEmail] = useState(false);
  const [daChamMatKhau, setDaChamMatKhau] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const duongDanTiepTheo = searchParams.get("next") || "/";
  const thongBao = useThongBao();

  const sdtLoi = daChamSdt && !sdtHopLe(soDienThoai);
  const emailLoi = daChamEmail && !emailNhap.trim();
  const matKhauLoi = daChamMatKhau && !matKhau;

  async function dangNhapVoi(email: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: matKhau,
    });

    setDangDangNhap(false);

    if (error) {
      thongBao("Đăng nhập thất bại: " + dichLoiSupabase(error.message), "loi");
    } else {
      thongBao("Đăng nhập thành công!", "thanhcong");
      router.push(duongDanTiepTheo);
    }
  }

  async function xuLyDangNhap() {
    setDaChamMatKhau(true);

    if (dungEmail) {
      setDaChamEmail(true);
      if (!emailNhap.trim()) {
        thongBao("Vui lòng nhập email bạn đã dùng để đăng ký.", "canhbao");
        return;
      }
      if (!matKhau) {
        thongBao("Vui lòng nhập mật khẩu.", "canhbao");
        return;
      }
      setDangDangNhap(true);
      await dangNhapVoi(emailNhap.trim());
      return;
    }

    setDaChamSdt(true);
    if (!sdtHopLe(soDienThoai)) {
      thongBao("Vui lòng nhập đúng số điện thoại (10 số, bắt đầu bằng 0).", "canhbao");
      return;
    }
    if (!matKhau) {
      thongBao("Vui lòng nhập mật khẩu.", "canhbao");
      return;
    }

    setDangDangNhap(true);

    // Luôn nhận về một email (kể cả số chưa đăng ký) → luôn đi tiếp tới bước đăng nhập,
    // thông báo lỗi chỉ có một kiểu duy nhất nên không dò được số nào đã đăng ký.
    const ketQua = await timEmailDangNhap(soDienThoai);
    if (ketQua.quaNhanh) {
      setDangDangNhap(false);
      thongBao("Bạn thao tác quá nhanh. Vui lòng thử lại sau vài phút.", "canhbao");
      return;
    }

    await dangNhapVoi(ketQua.email);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-paper px-4">
      <div className="w-full max-w-sm bg-card border border-line rounded-2xl p-6 sm:p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-ink mb-6 flex items-center gap-2">
          <LogIn className="w-6 h-6 text-teal" /> Đăng nhập
        </h1>

        <div className="flex flex-col gap-4">
          {!dungEmail ? (
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
          ) : (
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">
                Email đã đăng ký <span className="text-rust">*</span>
              </label>
              <input
                type="email"
                placeholder="ban@email.com"
                value={emailNhap}
                onChange={(e) => setEmailNhap(e.target.value)}
                onBlur={() => setDaChamEmail(true)}
                className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 outline-none transition-all ${
                  emailLoi
                    ? "border-rust focus:ring-rust/30 focus:border-rust"
                    : "border-line focus:ring-teal/30 focus:border-teal"
                }`}
              />
              {emailLoi && <p className="text-xs text-rust mt-1">Vui lòng nhập email.</p>}
            </div>
          )}

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

          <button
            type="button"
            onClick={() => setDungEmail((truoc) => !truoc)}
            className="text-xs text-ink-soft hover:text-teal underline self-center"
          >
            {dungEmail ? "Đăng nhập bằng số điện thoại" : "Tài khoản cũ đăng ký bằng email? Đăng nhập bằng email"}
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