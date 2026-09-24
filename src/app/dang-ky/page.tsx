"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { DANH_MUC_NGHE } from "../../lib/danhMuc";
import { chuanHoaSdt, sdtHopLe, taoEmailNoiBo, daCoTaiKhoanTheoSdt } from "../../lib/dangNhapSdt";
import { UserPlus } from "lucide-react";
import TruongMatKhau from "../../components/TruongMatKhau";
import { useThongBao } from "../../components/ThongBao";
import { dichLoiSupabase } from "../../lib/dichLoi";

export default function DangKy() {
  const [soDienThoaiTho, setSoDienThoaiTho] = useState("");
  const [tenTho, setTenTho] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState("");
  const [email, setEmail] = useState("");
  const [ngheTho, setNgheTho] = useState("");
  const [diaChiTho, setDiaChiTho] = useState("");
  const [danhMucDaChon, setDanhMucDaChon] = useState<string[]>([]);
  const [dangDangKy, setDangDangKy] = useState(false);
  const router = useRouter();
  const thongBao = useThongBao();

  const [daCham, setDaCham] = useState({
    sdt: false,
    ten: false,
    matKhau: false,
    xacNhan: false,
  });

  const sdtLoi = daCham.sdt && !sdtHopLe(soDienThoaiTho);
  const tenLoi = daCham.ten && !tenTho.trim();
  const matKhauLoi = daCham.matKhau && matKhau.length < 6;
  const xacNhanLoi = daCham.xacNhan && (xacNhanMatKhau !== matKhau || !xacNhanMatKhau);

  function toggleDanhMuc(giaTri: string) {
    setDanhMucDaChon((truoc) =>
      truoc.includes(giaTri) ? truoc.filter((d) => d !== giaTri) : [...truoc, giaTri]
    );
  }

  async function xuLyDangKy() {
    setDaCham({ sdt: true, ten: true, matKhau: true, xacNhan: true });

    if (danhMucDaChon.length === 0) {
      thongBao("Vui lòng chọn ít nhất 1 ngành bạn nhận làm.", "canhbao");
      return;
    }

    const soSach = chuanHoaSdt(soDienThoaiTho);
    if (!sdtHopLe(soDienThoaiTho)) {
      thongBao("Vui lòng nhập đúng số điện thoại (10 số, bắt đầu bằng 0) — khách sẽ dùng số này để liên lạc với bạn.", "canhbao");
      return;
    }
    if (!tenTho.trim()) {
      thongBao("Vui lòng nhập tên của bạn.", "canhbao");
      return;
    }
    if (matKhau.length < 6) {
      thongBao("Mật khẩu cần ít nhất 6 ký tự.", "canhbao");
      return;
    }
    if (xacNhanMatKhau !== matKhau) {
      thongBao("Xác nhận mật khẩu không khớp.", "loi");
      return;
    }

    setDangDangKy(true);

    if (await daCoTaiKhoanTheoSdt(soSach)) {
      setDangDangKy(false);
      thongBao("Số điện thoại này đã có tài khoản. Vui lòng đăng nhập.", "loi");
      return;
    }

    const emailDeDangKy = email.trim() || taoEmailNoiBo(soSach);

    const { data, error } = await supabase.auth.signUp({
      email: emailDeDangKy,
      password: matKhau,
    });

    if (error) {
      setDangDangKy(false);
      thongBao("Đăng ký thất bại: " + dichLoiSupabase(error.message), "loi");
      return;
    }

    const userId = data.user?.id;

    const { error: loiTaoHoSo } = await supabase.from("tho").insert([
      {
        ten: tenTho,
        nghe: ngheTho,
        dia_chi: diaChiTho,
        so_dien_thoai: soSach,
        email_dang_nhap: emailDeDangKy,
        danh_muc: danhMucDaChon,
        user_id: userId,
        so_don_hoan_thanh: 0,
        danh_gia_sao: 0,
      },
    ]);

    setDangDangKy(false);

    if (loiTaoHoSo) {
      thongBao("Lỗi tạo hồ sơ: " + dichLoiSupabase(loiTaoHoSo.message), "loi");
    } else if (data.session) {
      thongBao("Đăng ký thành công!", "thanhcong");
      router.push("/tho-gan-ban");
    } else {
      thongBao("Đăng ký thành công! Vui lòng đăng nhập lại bằng số điện thoại vừa đăng ký.", "thanhcong");
      router.push("/login");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-paper py-10 px-4">
      <div className="w-full max-w-sm bg-card border border-line rounded-2xl p-6 sm:p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-ink mb-6 flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-teal" /> Đăng ký làm thợ
        </h1>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Số điện thoại (Zalo) <span className="text-rust">*</span>
            </label>
            <input
              type="tel"
              placeholder="09xx xxx xxx"
              value={soDienThoaiTho}
              onChange={(e) => setSoDienThoaiTho(e.target.value)}
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
                Nhập số thật — khách sẽ gọi/nhắn Zalo qua số này để đặt lịch với bạn.
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
              value={tenTho}
              onChange={(e) => setTenTho(e.target.value)}
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

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Nghề (mô tả chi tiết)</label>
            <input
              type="text"
              placeholder="Ví dụ: Sửa điện lạnh, điện nước..."
              value={ngheTho}
              onChange={(e) => setNgheTho(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-line focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Bạn nhận làm ngành nào? <span className="text-rust">*</span>
            </label>
            <div className="flex flex-col gap-1.5 border border-line rounded-lg p-3 bg-paper">
              {DANH_MUC_NGHE.map((muc) => (
                <label key={muc.gia_tri} className="flex items-center gap-2 text-sm text-ink-soft">
                  <input
                    type="checkbox"
                    checked={danhMucDaChon.includes(muc.gia_tri)}
                    onChange={() => toggleDanhMuc(muc.gia_tri)}
                    className="w-4 h-4 accent-teal"
                  />
                  {muc.nhan}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Địa chỉ</label>
            <input
              type="text"
              placeholder="Địa chỉ của bạn"
              value={diaChiTho}
              onChange={(e) => setDiaChiTho(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-line focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none transition-all"
            />
          </div>

          <button
            className="bg-teal hover:opacity-90 transition text-white px-4 py-2.5 rounded-lg w-full font-semibold disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
            onClick={xuLyDangKy}
            disabled={dangDangKy}
          >
            <UserPlus className="w-4 h-4" />
            <span>{dangDangKy ? "Đang đăng ký..." : "Đăng ký"}</span>
          </button>
        </div>

        <p className="text-sm text-center mt-5 text-ink-soft">
          Đã có tài khoản?{" "}
          <a href="/login" className="text-teal font-semibold underline">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
}