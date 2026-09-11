"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { chuanHoaSdt, taoEmailNoiBo, daCoTaiKhoanTheoSdt } from "../../lib/dangNhapSdt";
import { UserPlus } from "lucide-react";

function NoiDungDangKyKhach() {
  const [soDienThoai, setSoDienThoai] = useState("");
  const [tenKhach, setTenKhach] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [email, setEmail] = useState("");
  const [dangDangKy, setDangDangKy] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const duongDanTiepTheo = searchParams.get("next") || "/";

  async function xuLyDangKy() {
    const soSach = chuanHoaSdt(soDienThoai);
    if (!soSach) {
      alert("Vui lòng nhập số điện thoại — thợ sẽ dùng số này để liên lạc với bạn.");
      return;
    }
    if (!tenKhach.trim()) {
      alert("Vui lòng nhập tên của bạn.");
      return;
    }
    if (!matKhau) {
      alert("Vui lòng nhập mật khẩu.");
      return;
    }

    setDangDangKy(true);

    if (await daCoTaiKhoanTheoSdt(soSach)) {
      setDangDangKy(false);
      alert("Số điện thoại này đã có tài khoản. Vui lòng đăng nhập.");
      return;
    }

    const emailDeDangKy = email.trim() || taoEmailNoiBo(soSach);

    const { data, error } = await supabase.auth.signUp({
      email: emailDeDangKy,
      password: matKhau,
      options: {
        data: { role: "khach" },
      },
    });

    if (error) {
      setDangDangKy(false);
      alert("Đăng ký thất bại: " + error.message);
      return;
    }

    const userId = data.user?.id;

    const { error: loiTaoHoSo } = await supabase.from("khach").insert([
      {
        user_id: userId,
        ten: tenKhach,
        so_dien_thoai: soSach,
        email_dang_nhap: emailDeDangKy,
      },
    ]);

    setDangDangKy(false);

    if (loiTaoHoSo) {
      alert("Lỗi tạo hồ sơ khách: " + loiTaoHoSo.message);
      return;
    }

    if (data.session) {
      // Không cần xác nhận email — đã đăng nhập luôn, quay lại đúng trang đang dở.
      router.push(duongDanTiepTheo);
    } else {
      alert("Đăng ký thành công! Vui lòng đăng nhập lại bằng số điện thoại vừa đăng ký.");
      router.push(
        `/login${duongDanTiepTheo !== "/" ? `?next=${encodeURIComponent(duongDanTiepTheo)}` : ""}`
      );
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-paper">
      <div className="border border-line rounded-2xl p-6 w-80 bg-card shadow-sm">
        <h1 className="text-xl font-bold mb-4 text-ink">Đăng ký tài khoản khách hàng</h1>

        <label className="block text-sm font-semibold text-ink mb-1">
          Số điện thoại <span className="text-rust">*</span>
        </label>
        <input
          type="tel"
          placeholder="Số điện thoại liên lạc"
          value={soDienThoai}
          onChange={(e) => setSoDienThoai(e.target.value)}
          className="border border-line rounded-lg px-3 py-2 mb-1 w-full outline-none focus:border-teal"
        />
        <p className="text-xs text-ink-soft mb-2">
          Nhập số thật — thợ sẽ gọi/nhắn Zalo qua số này khi nhận đơn của bạn.
        </p>

        <input
          type="text"
          placeholder="Tên của bạn"
          value={tenKhach}
          onChange={(e) => setTenKhach(e.target.value)}
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
          type="email"
          placeholder="Email (có thể bỏ trống)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-line rounded-lg px-3 py-2 mb-3 w-full outline-none focus:border-teal"
        />

        <button
          className="bg-teal hover:opacity-90 transition text-white px-4 py-2 rounded-lg w-full font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          onClick={xuLyDangKy}
          disabled={dangDangKy}
        >
          <UserPlus className="w-4 h-4" />
          <span>{dangDangKy ? "Đang đăng ký..." : "Đăng ký"}</span>
        </button>
        <p className="text-sm text-center mt-3 text-ink-soft">
          Đã có tài khoản?{" "}
          <a
            href={`/login${duongDanTiepTheo !== "/" ? `?next=${encodeURIComponent(duongDanTiepTheo)}` : ""}`}
            className="text-teal underline"
          >
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
}

export default function DangKyKhach() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-paper">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rust"></div>
        </div>
      }
    >
      <NoiDungDangKyKhach />
    </Suspense>
  );
}