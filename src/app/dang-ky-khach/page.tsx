"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { chuanHoaSdt, sdtHopLe, taoEmailNoiBo, daCoTaiKhoanTheoSdt } from "../../lib/dangNhapSdt";
import { UserPlus } from "lucide-react";
import TruongMatKhau from "../../components/TruongMatKhau";

function NoiDungDangKyKhach() {
  const [soDienThoai, setSoDienThoai] = useState("");
  const [tenKhach, setTenKhach] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState("");
  const [email, setEmail] = useState("");
  const [dangDangKy, setDangDangKy] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const duongDanTiepTheo = searchParams.get("next") || "/";

  const [daCham, setDaCham] = useState({
    sdt: false,
    ten: false,
    matKhau: false,
    xacNhan: false,
  });

  const sdtLoi = daCham.sdt && !sdtHopLe(soDienThoai);
  const tenLoi = daCham.ten && !tenKhach.trim();
  const matKhauLoi = daCham.matKhau && matKhau.length < 6;
  const xacNhanLoi = daCham.xacNhan && (xacNhanMatKhau !== matKhau || !xacNhanMatKhau);

  async function xuLyDangKy() {
    setDaCham({ sdt: true, ten: true, matKhau: true, xacNhan: true });

    const soSach = chuanHoaSdt(soDienThoai);
    if (!sdtHopLe(soDienThoai)) {
      alert("Vui lòng nhập đúng số điện thoại (10 số, bắt đầu bằng 0) — thợ sẽ dùng số này để liên lạc với bạn.");
      return;
    }
    if (!tenKhach.trim()) {
      alert("Vui lòng nhập tên của bạn.");
      return;
    }
    if (matKhau.length < 6) {
      alert("Mật khẩu cần ít nhất 6 ký tự.");
      return;
    }
    if (xacNhanMatKhau !== matKhau) {
      alert("Xác nhận mật khẩu không khớp.");
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-paper py-10 px-4">
      <div className="w-full max-w-sm bg-card border border-line rounded-2xl p-6 sm:p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-ink mb-6 flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-rust" /> Đăng ký khách hàng
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
              onBlur={() => setDaCham((t) => ({ ...t, sdt: true }))}
              className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 outline-none transition-all ${
                sdtLoi
                  ? "border-rust focus:ring-rust/30 focus:border-rust"
                  : "border-line focus:ring-teal/30 focus:border-teal"
              }`}
            />
            {sdtLoi ? (
              <p className="text-xs text-rust mt-1">Số điện thoại cần đủ 10 số, bắt đầu bằng 0.</p>
            ) : (
              <p className="text-xs text-ink-soft mt-1">
                Nhập số thật — thợ sẽ gọi/nhắn Zalo qua số này khi nhận đơn của bạn.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Tên của bạn <span className="text-rust">*</span>
            </label>
            <input
              type="text"
              placeholder="Nhập họ và tên"
              value={tenKhach}
              onChange={(e) => setTenKhach(e.target.value)}
              onBlur={() => setDaCham((t) => ({ ...t, ten: true }))}
              className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 outline-none transition-all ${
                tenLoi
                  ? "border-rust focus:ring-rust/30 focus:border-rust"
                  : "border-line focus:ring-teal/30 focus:border-teal"
              }`}
            />
            {tenLoi && <p className="text-xs text-rust mt-1">Vui lòng nhập tên của bạn.</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Mật khẩu <span className="text-rust">*</span>
            </label>
            <TruongMatKhau
              value={matKhau}
              onChange={setMatKhau}
              onBlur={() => setDaCham((t) => ({ ...t, matKhau: true }))}
              placeholder="Ít nhất 6 ký tự"
              loi={matKhauLoi}
            />
            {matKhauLoi && <p className="text-xs text-rust mt-1">Mật khẩu cần ít nhất 6 ký tự.</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Xác nhận mật khẩu <span className="text-rust">*</span>
            </label>
            <TruongMatKhau
              value={xacNhanMatKhau}
              onChange={setXacNhanMatKhau}
              onBlur={() => setDaCham((t) => ({ ...t, xacNhan: true }))}
              placeholder="Nhập lại mật khẩu"
              loi={xacNhanLoi}
            />
            {xacNhanLoi && <p className="text-xs text-rust mt-1">Xác nhận mật khẩu chưa khớp.</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Email <span className="text-ink-soft font-normal">(có thể bỏ trống)</span>
            </label>
            <input
              type="email"
              placeholder="ban@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-line focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none transition-all"
            />
          </div>

          <button
            className="bg-rust hover:opacity-90 transition text-white px-4 py-2.5 rounded-lg w-full font-semibold disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
            onClick={xuLyDangKy}
            disabled={dangDangKy}
          >
            <UserPlus className="w-4 h-4" />
            <span>{dangDangKy ? "Đang đăng ký..." : "Đăng ký"}</span>
          </button>
        </div>

        <p className="text-sm text-center mt-5 text-ink-soft">
          Đã có tài khoản?{" "}
          <a
            href={`/login${duongDanTiepTheo !== "/" ? `?next=${encodeURIComponent(duongDanTiepTheo)}` : ""}`}
            className="text-teal font-semibold underline"
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