"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { DANH_MUC_NGHE } from "../../lib/danhMuc";

export default function DangKy() {
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [tenTho, setTenTho] = useState("");
  const [ngheTho, setNgheTho] = useState("");
  const [diaChiTho, setDiaChiTho] = useState("");
  const [soDienThoaiTho, setSoDienThoaiTho] = useState("");
  const [danhMucDaChon, setDanhMucDaChon] = useState<string[]>([]);
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

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: matKhau,
    });

    if (error) {
      alert("Đăng ký thất bại: " + error.message);
      return;
    }

    const userId = data.user?.id;

    const { error: loiTaoHoSo } = await supabase.from("tho").insert([
      {
        ten: tenTho,
        nghe: ngheTho,
        dia_chi: diaChiTho,
        so_dien_thoai: soDienThoaiTho,
        danh_muc: danhMucDaChon,
        user_id: userId,
        so_don_hoan_thanh: 0,
        danh_gia_sao: 0,
      },
    ]);

    if (loiTaoHoSo) {
      alert("Lỗi tạo hồ sơ: " + loiTaoHoSo.message);
    } else {
      alert("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận (nếu có).");
      router.push("/login");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="border border-gray-300 rounded-xl p-6 w-80 bg-white">
        <h1 className="text-xl font-bold mb-4">Đăng ký làm thợ</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 mb-2 w-full"
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={matKhau}
          onChange={(e) => setMatKhau(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 mb-2 w-full"
        />
        <input
          type="text"
          placeholder="Tên của bạn"
          value={tenTho}
          onChange={(e) => setTenTho(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 mb-2 w-full"
        />
        <input
          type="text"
          placeholder="Nghề (mô tả chi tiết)"
          value={ngheTho}
          onChange={(e) => setNgheTho(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 mb-2 w-full"
        />

        <div className="mb-2">
          <p className="text-sm font-semibold text-gray-700 mb-1.5">
            Bạn nhận làm ngành nào? <span className="text-red-500">*</span>
          </p>
          <div className="flex flex-col gap-1.5 border border-gray-200 rounded-lg p-3 bg-gray-50">
            {DANH_MUC_NGHE.map((muc) => (
              <label key={muc.gia_tri} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={danhMucDaChon.includes(muc.gia_tri)}
                  onChange={() => toggleDanhMuc(muc.gia_tri)}
                  className="w-4 h-4 accent-blue-500"
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
          className="border border-gray-300 rounded-lg px-3 py-2 mb-2 w-full"
        />
        <input
          type="tel"
          placeholder="Số điện thoại (Zalo)"
          value={soDienThoaiTho}
          onChange={(e) => setSoDienThoaiTho(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 mb-3 w-full"
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full"
          onClick={xuLyDangKy}
        >
          Đăng ký
        </button>
        <p className="text-sm text-center mt-3">
  Đã có tài khoản?{" "}
  <a href="/login" className="text-blue-500 underline">
    Đăng nhập
  </a>
</p>
      </div>
    </div>
  );
}