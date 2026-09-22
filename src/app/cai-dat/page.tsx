"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { chuanHoaSdt, sdtHopLe } from "../../lib/dangNhapSdt";
import { User, Phone, KeyRound, Save, Wrench, ArrowLeft } from "lucide-react";
import TruongMatKhau from "../../components/TruongMatKhau";
import { useThongBao } from "../../components/ThongBao";

type VaiTro = "khach" | "tho";

type HoSoTaiKhoan = {
  id: number;
  ten: string;
  so_dien_thoai: string;
  email_dang_nhap: string;
};

export default function CaiDat() {
  const router = useRouter();
  const thongBao = useThongBao();
  const [dangTai, setDangTai] = useState(true);
  const [vaiTro, setVaiTro] = useState<VaiTro | null>(null);
  const [hoSo, setHoSo] = useState<HoSoTaiKhoan | null>(null);

  const [ten, setTen] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [dangLuuThongTin, setDangLuuThongTin] = useState(false);

  const [matKhauHienTai, setMatKhauHienTai] = useState("");
  const [matKhauMoi, setMatKhauMoi] = useState("");
  const [xacNhanMatKhauMoi, setXacNhanMatKhauMoi] = useState("");
  const [dangDoiMatKhau, setDangDoiMatKhau] = useState(false);

  const [daCham, setDaCham] = useState({
    ten: false,
    sdt: false,
    matKhauHienTai: false,
    matKhauMoi: false,
    xacNhan: false,
  });

  const tenLoi = daCham.ten && !ten.trim();
  const sdtLoi = daCham.sdt && !sdtHopLe(soDienThoai);
  const matKhauHienTaiLoi = daCham.matKhauHienTai && !matKhauHienTai;
  const matKhauMoiLoi = daCham.matKhauMoi && matKhauMoi.length > 0 && matKhauMoi.length < 6;
  const xacNhanLoi = daCham.xacNhan && xacNhanMatKhauMoi !== matKhauMoi;

  useEffect(() => {
    async function layThongTinTaiKhoan() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push("/login?next=/cai-dat");
        return;
      }

      const userId = sessionData.session.user.id;

      const { data: khachData } = await supabase
        .from("khach")
        .select("id, ten, so_dien_thoai, email_dang_nhap")
        .eq("user_id", userId)
        .maybeSingle();

      if (khachData) {
        setVaiTro("khach");
        setHoSo(khachData as HoSoTaiKhoan);
        setTen(khachData.ten || "");
        setSoDienThoai(khachData.so_dien_thoai || "");
        setDangTai(false);
        return;
      }

      const { data: thoData } = await supabase
        .from("tho")
        .select("id, ten, so_dien_thoai, email_dang_nhap")
        .eq("user_id", userId)
        .maybeSingle();

      if (thoData) {
        setVaiTro("tho");
        setHoSo(thoData as HoSoTaiKhoan);
        setTen(thoData.ten || "");
        setSoDienThoai(thoData.so_dien_thoai || "");
      }

      setDangTai(false);
    }
    layThongTinTaiKhoan();
  }, [router]);

  async function luuThongTin() {
    if (!hoSo || !vaiTro) return;

    setDaCham((t) => ({ ...t, ten: true, sdt: true }));

    const soSach = chuanHoaSdt(soDienThoai);
    if (!ten.trim()) {
      thongBao("Vui lòng nhập tên.", "canhbao");
      return;
    }
    if (!sdtHopLe(soDienThoai)) {
      thongBao("Vui lòng nhập đúng số điện thoại (10 số, bắt đầu bằng 0).", "canhbao");
      return;
    }

    setDangLuuThongTin(true);
    const { error } = await supabase
      .from(vaiTro)
      .update({ ten: ten.trim(), so_dien_thoai: soSach })
      .eq("id", hoSo.id);
    setDangLuuThongTin(false);

    if (error) {
      thongBao("Lỗi khi lưu: " + error.message, "loi");
    } else {
      setSoDienThoai(soSach);
      setHoSo({ ...hoSo, ten: ten.trim(), so_dien_thoai: soSach });
      thongBao("Cập nhật thông tin thành công!", "thanhcong");
    }
  }

  async function doiMatKhau() {
    if (!hoSo) return;

    setDaCham((t) => ({ ...t, matKhauHienTai: true, matKhauMoi: true, xacNhan: true }));

    if (!matKhauHienTai || !matKhauMoi || !xacNhanMatKhauMoi) {
      thongBao("Vui lòng nhập đủ mật khẩu hiện tại, mật khẩu mới và xác nhận.", "canhbao");
      return;
    }
    if (matKhauMoi.length < 6) {
      thongBao("Mật khẩu mới cần ít nhất 6 ký tự.", "canhbao");
      return;
    }
    if (matKhauMoi !== xacNhanMatKhauMoi) {
      thongBao("Mật khẩu mới và xác nhận không khớp.", "loi");
      return;
    }

    setDangDoiMatKhau(true);

    // Xác thực lại mật khẩu hiện tại trước khi cho đổi — tránh trường hợp máy
    // đang đăng nhập sẵn bị người khác lợi dụng đổi mật khẩu.
    const { error: loiXacThuc } = await supabase.auth.signInWithPassword({
      email: hoSo.email_dang_nhap,
      password: matKhauHienTai,
    });

    if (loiXacThuc) {
      setDangDoiMatKhau(false);
      thongBao("Mật khẩu hiện tại không đúng.", "thongtin");
      return;
    }

    const { error: loiDoi } = await supabase.auth.updateUser({ password: matKhauMoi });
    setDangDoiMatKhau(false);

    if (loiDoi) {
      thongBao("Lỗi khi đổi mật khẩu: " + loiDoi.message, "loi");
    } else {
      setMatKhauHienTai("");
      setMatKhauMoi("");
      setXacNhanMatKhauMoi("");
      setDaCham((t) => ({ ...t, matKhauHienTai: false, matKhauMoi: false, xacNhan: false }));
      thongBao("Đổi mật khẩu thành công!", "thanhcong");
    }
  }

  if (dangTai) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rust"></div>
      </div>
    );
  }

  if (!hoSo || !vaiTro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper p-6">
        <p className="text-ink-soft">Không tìm thấy tài khoản của bạn.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper py-10 px-4">
      <div className="max-w-md mx-auto flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ink">Cài đặt tài khoản</h1>
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-ink-soft hover:text-ink transition"
          >
            <ArrowLeft className="w-4 h-4" /> Trang chủ
          </Link>
        </div>

        {vaiTro === "tho" && (
          <Link
            href="/ho-so"
            className="flex items-center justify-between bg-teal-soft border border-teal/20 rounded-xl px-4 py-3 text-sm font-semibold text-teal hover:opacity-80 transition"
          >
            <span className="flex items-center gap-2">
              <Wrench className="w-4 h-4" /> Hồ sơ nghề nghiệp (ảnh, mô tả, khu vực hoạt động)
            </span>
            <span>→</span>
          </Link>
        )}

        {/* THÔNG TIN TÀI KHOẢN */}
        <div className="bg-card border border-line rounded-2xl p-6 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink mb-1">Thông tin tài khoản</h2>

          <div>
            <label className="text-sm font-semibold text-ink mb-1 flex items-center gap-1.5">
              <User className="w-4 h-4 text-ink-soft" /> Tên
            </label>
            <input
              type="text"
              value={ten}
              onChange={(e) => setTen(e.target.value)}
              onBlur={() => setDaCham((t) => ({ ...t, ten: true }))}
              className={`border rounded-lg px-3 py-2 w-full outline-none transition text-sm ${
                tenLoi ? "border-rust focus:border-rust" : "border-line focus:border-teal"
              }`}
            />
            {tenLoi && <p className="text-xs text-rust mt-1">Vui lòng nhập tên.</p>}
          </div>

          <div>
            <label className="text-sm font-semibold text-ink mb-1 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-ink-soft" /> Số điện thoại
            </label>
            <input
              type="tel"
              value={soDienThoai}
              onChange={(e) => setSoDienThoai(e.target.value)}
              onBlur={() => setDaCham((t) => ({ ...t, sdt: true }))}
              className={`border rounded-lg px-3 py-2 w-full outline-none transition text-sm ${
                sdtLoi ? "border-rust focus:border-rust" : "border-line focus:border-teal"
              }`}
            />
            {sdtLoi ? (
              <p className="text-xs text-rust mt-1">Số điện thoại cần đủ 10 số, bắt đầu bằng 0.</p>
            ) : (
              <p className="text-xs text-ink-soft mt-1">
                Đây cũng là số bạn dùng để đăng nhập — đổi số ở đây thì lần đăng nhập sau nhập số mới.
              </p>
            )}
          </div>

          <button
            className="flex items-center justify-center gap-2 bg-rust hover:opacity-90 text-white px-4 py-2.5 rounded-xl w-full font-semibold disabled:opacity-50 transition"
            onClick={luuThongTin}
            disabled={dangLuuThongTin}
          >
            <Save className="w-4 h-4" />
            {dangLuuThongTin ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>

        {/* ĐỔI MẬT KHẨU */}
        <div className="bg-card border border-line rounded-2xl p-6 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink mb-1 flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-ink-soft" /> Đổi mật khẩu
          </h2>

          <div>
            <TruongMatKhau
              value={matKhauHienTai}
              onChange={setMatKhauHienTai}
              onBlur={() => setDaCham((t) => ({ ...t, matKhauHienTai: true }))}
              placeholder="Mật khẩu hiện tại"
              loi={matKhauHienTaiLoi}
            />
            {matKhauHienTaiLoi && (
              <p className="text-xs text-rust mt-1">Vui lòng nhập mật khẩu hiện tại.</p>
            )}
          </div>

          <div>
            <TruongMatKhau
              value={matKhauMoi}
              onChange={setMatKhauMoi}
              onBlur={() => setDaCham((t) => ({ ...t, matKhauMoi: true }))}
              placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
              loi={matKhauMoiLoi}
            />
            {matKhauMoiLoi && (
              <p className="text-xs text-rust mt-1">Mật khẩu mới cần ít nhất 6 ký tự.</p>
            )}
          </div>

          <div>
            <TruongMatKhau
              value={xacNhanMatKhauMoi}
              onChange={setXacNhanMatKhauMoi}
              onBlur={() => setDaCham((t) => ({ ...t, xacNhan: true }))}
              placeholder="Xác nhận mật khẩu mới"
              loi={xacNhanLoi}
            />
            {xacNhanLoi && <p className="text-xs text-rust mt-1">Xác nhận mật khẩu chưa khớp.</p>}
          </div>

          <button
            className="flex items-center justify-center gap-2 bg-teal hover:opacity-90 text-white px-4 py-2.5 rounded-xl w-full font-semibold disabled:opacity-50 transition"
            onClick={doiMatKhau}
            disabled={dangDoiMatKhau}
          >
            <KeyRound className="w-4 h-4" />
            {dangDoiMatKhau ? "Đang đổi..." : "Đổi mật khẩu"}
          </button>
        </div>
      </div>
    </div>
  );
}