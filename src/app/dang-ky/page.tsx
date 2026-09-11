"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { DANH_MUC_NGHE } from "../../lib/danhMuc";
import { chuanHoaSdt, taoEmailNoiBo, daCoTaiKhoanTheoSdt } from "../../lib/dangNhapSdt";
import { UserPlus } from "lucide-react";

export default function DangKy() {
  const [soDienThoaiTho, setSoDienThoaiTho] = useState("");
  const [tenTho, setTenTho] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [email, setEmail] = useState("");
  const [ngheTho, setNgheTho] = useState("");
  const [diaChiTho, setDiaChiTho] = useState("");
  const [danhMucDaChon, setDanhMucDaChon] = useState<string[]>([]);
  const [dangDangKy, setDangDangKy] = useState(false);
  const router = useRouter();

  function toggleDanhMuc(giaTri: string) {
    setDanhMucDaChon((truoc) =>
      truoc.includes(giaTri) ? truoc.filter((d) => d !== giaTri) : [...truoc, giaTri]
    );
  }

  async function xuLyDangKy() {
    if (danhMucDaChon.length === 0) {
      alert("Vui lòng chọn ít nhất 1 ngành bạn nhận làm.");
      return;
    }

    const soSach = chuanHoaSdt(soDienThoaiTho);
    if (!soSach) {
      alert("Vui lòng nhập số điện thoại — khách sẽ dùng số này để liên lạc với bạn.");
      return;
    }
    if (!tenTho.trim()) {
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
    });

    if (error) {
      setDangDangKy(false);
      alert("Đăng ký thất bại: " + error.message);
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
      alert("Lỗi tạo hồ sơ: " + loiTaoHoSo.message);
    } else if (data.session) {
      alert("Đăng ký thành công!");
      router.push("/tho-gan-ban");
    } else {
      alert("Đăng ký thành công! Vui lòng đăng nhập lại bằng số điện thoại vừa đăng ký.");
      router.push("/login");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-paper">
      <div className="border border-line rounded-2xl p-6 w-80 bg-card shadow-sm">
        <h1 className="text-xl font-bold mb-4 text-ink">Đăng ký làm thợ</h1>

        <label className="block text-sm font-semibold text-ink mb-1">
          Số điện thoại (Zalo) <span className="text-rust">*</span>
        </label>
        <input
          type="tel"
          placeholder="Số điện thoại liên lạc"
          value={soDienThoaiTho}
          onChange={(e) => setSoDienThoaiTho(e.target.value)}
          className="border border-line rounded-lg px-3 py-2 mb-1 w-full outline-none focus:border-teal"
        />
        <p className="text-xs text-ink-soft mb-2">
          Nhập số thật — khách sẽ gọi/nhắn Zalo qua số này để đặt lịch với bạn.
        </p>

        <input
          type="text"
          placeholder="Tên của bạn"
          value={tenTho}
          onChange={(e) => setTenTho(e.target.value)}
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
          className="border border-line rounded-lg px-3 py-2 mb-2 w-full outline-none focus:border-teal"
        />
        <input
          type="text"
          placeholder="Nghề (mô tả chi tiết)"
          value={ngheTho}
          onChange={(e) => setNgheTho(e.target.value)}
          className="border border-line rounded-lg px-3 py-2 mb-2 w-full outline-none focus:border-teal"
        />

        <div className="mb-2">
          <p className="text-sm font-semibold text-ink mb-1.5">
            Bạn nhận làm ngành nào? <span className="text-rust">*</span>
          </p>
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

        <input
          type="text"
          placeholder="Địa chỉ"
          value={diaChiTho}
          onChange={(e) => setDiaChiTho(e.target.value)}
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
          <a href="/login" className="text-teal underline">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
}