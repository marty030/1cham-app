"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import ChonKhuVucHoatDong from "../../components/ChonKhuVucHoatDong";
import { Camera, MapPin, PauseCircle, PlayCircle, Save, Star } from "lucide-react";

export default function HoSo() {
  const [hoSo, setHoSo] = useState<any>(null);
  const [dangTai, setDangTai] = useState(true);
  const [ten, setTen] = useState("");
  const [moTaCongViec, setMoTaCongViec] = useState("");
  const [diaChi, setDiaChi] = useState("");
  const [viDo, setViDo] = useState<number | null>(null);
  const [kinhDo, setKinhDo] = useState<number | null>(null);
  const [banKinh, setBanKinh] = useState(10);
  const [anhDaiDien, setAnhDaiDien] = useState<string | null>(null);
  const [dangTaiAnh, setDangTaiAnh] = useState(false);
  const [dangNghi, setDangNghi] = useState(false);
  const [dangLuu, setDangLuu] = useState(false);
  const router = useRouter();
  const inputAnhRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function layHoSo() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("tho")
        .select("*")
        .eq("user_id", sessionData.session.user.id)
        .single();

      if (error) {
        console.log("Lỗi:", error);
      } else {
        setHoSo(data);
        setTen(data.ten);
        setMoTaCongViec(data.nghe || "");
        setDiaChi(data.dia_chi || "");
        setViDo(data.vi_do ?? null);
        setKinhDo(data.kinh_do ?? null);
        setDangNghi(data.dang_nghi || false);
        setBanKinh(data.ban_kinh_hoat_dong ?? 10);
        setAnhDaiDien(data.anh_dai_dien ?? null);
      }
      setDangTai(false);
    }
    layHoSo();
  }, [router]);

  async function luuHoSo() {
    setDangLuu(true);
    const { error } = await supabase
      .from("tho")
      .update({
        ten,
        nghe: moTaCongViec,
        dia_chi: diaChi,
        vi_do: viDo,
        kinh_do: kinhDo,
        ban_kinh_hoat_dong: banKinh,
      })
      .eq("id", hoSo.id);

    setDangLuu(false);

    if (error) {
      alert("Lỗi khi lưu: " + error.message);
    } else {
      alert("Cập nhật hồ sơ thành công!");
    }
  }

  async function doiTrangThaiNghi() {
    const trangThaiMoi = !dangNghi;
    const { error } = await supabase
      .from("tho")
      .update({ dang_nghi: trangThaiMoi })
      .eq("id", hoSo.id);

    if (error) {
      alert("Lỗi: " + error.message);
    } else {
      setDangNghi(trangThaiMoi);
    }
  }

  function doiViTriTrungTam(lat: number, lng: number, diaChiMoi: string) {
    setViDo(lat);
    setKinhDo(lng);
    if (diaChiMoi) setDiaChi(diaChiMoi);
  }

  async function xuLyChonAnh(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !hoSo) return;

    setDangTaiAnh(true);
    const duoiFile = file.name.split(".").pop() || "jpg";
    const duongDan = `${hoSo.user_id}/avatar.${duoiFile}`;

    const { error: loiUpload } = await supabase.storage
      .from("avatars")
      .upload(duongDan, file, { upsert: true, cacheControl: "3600" });

    if (loiUpload) {
      setDangTaiAnh(false);
      alert("Lỗi tải ảnh lên: " + loiUpload.message);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(duongDan);
    // Thêm tham số thời gian để phá cache trình duyệt — vì dùng chung 1 đường
    // dẫn (upsert) nên ảnh mới sẽ không tự hiện nếu không có bước này.
    const urlMoi = `${urlData.publicUrl}?t=${Date.now()}`;

    const { error: loiCapNhat } = await supabase
      .from("tho")
      .update({ anh_dai_dien: urlMoi })
      .eq("id", hoSo.id);

    setDangTaiAnh(false);

    if (loiCapNhat) {
      alert("Lỗi lưu ảnh đại diện: " + loiCapNhat.message);
    } else {
      setAnhDaiDien(urlMoi);
    }
  }

  if (dangTai) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rust"></div>
      </div>
    );
  }

  if (!hoSo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper p-6">
        <p className="text-ink-soft">Không tìm thấy hồ sơ của bạn.</p>
      </div>
    );
  }

  const chuCaiDau = ten ? ten.charAt(0).toUpperCase() : "T";

  return (
    <div className="min-h-screen bg-paper py-10 px-4">
      <div className="max-w-md mx-auto flex flex-col gap-5">
        <h1 className="text-2xl font-bold text-ink">Hồ sơ của tôi</h1>

        {/* ẢNH ĐẠI DIỆN */}
<div className="bg-card border border-line rounded-2xl p-6 flex flex-col items-center gap-3">
  <div className="w-24 h-24 rounded-full overflow-hidden bg-teal-soft text-teal flex items-center justify-center text-3xl font-bold shrink-0">
    {anhDaiDien ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={anhDaiDien} alt="Ảnh đại diện" className="w-full h-full object-cover" />
    ) : (
      chuCaiDau
    )}
  </div>
  <input
    ref={inputAnhRef}
    type="file"
    accept="image/*"
    onChange={xuLyChonAnh}
    className="hidden"
  />
  <button
    type="button"
    onClick={() => inputAnhRef.current?.click()}
    disabled={dangTaiAnh}
    className="flex items-center gap-1.5 text-sm font-semibold text-teal border border-teal/30 bg-teal-soft hover:opacity-80 px-4 py-2 rounded-lg disabled:opacity-50 transition"
  >
    <Camera className="w-4 h-4" />
    {dangTaiAnh ? "Đang tải ảnh lên..." : anhDaiDien ? "Đổi ảnh đại diện" : "Tải ảnh đại diện lên"}
  </button>
</div>

        {/* THÔNG TIN CHUNG */}
        <div className="bg-card border border-line rounded-2xl p-6 flex flex-col gap-3">
          <div>
            <label className="text-sm font-semibold text-ink mb-1 block">Tên</label>
            <input
              type="text"
              value={ten}
              onChange={(e) => setTen(e.target.value)}
              className="border border-line rounded-lg px-3 py-2 w-full outline-none focus:border-teal text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-ink mb-1 block">Mô tả công việc</label>
            <textarea
              value={moTaCongViec}
              onChange={(e) => setMoTaCongViec(e.target.value)}
              rows={2}
              placeholder="Ví dụ: Sửa điều hòa, tủ lạnh, máy giặt tại nhà, có xe riêng..."
              className="border border-line rounded-lg px-3 py-2 w-full outline-none focus:border-teal text-sm resize-none"
            />
          </div>
        </div>

        {/* KHU VỰC HOẠT ĐỘNG */}
        <div className="bg-card border border-line rounded-2xl p-6 flex flex-col gap-2">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink"><MapPin className="w-4 h-4" /> Khu vực hoạt động</p>
          <ChonKhuVucHoatDong
            viDo={viDo}
            kinhDo={kinhDo}
            banKinh={banKinh}
            diaChi={diaChi}
            onDoiViTri={doiViTriTrungTam}
            onDoiBanKinh={setBanKinh}
          />
        </div>

       {/* TRẠNG THÁI + ĐÁNH GIÁ */}
<div className="bg-card border border-line rounded-2xl p-6 flex flex-col gap-3">
  <p className="flex items-center gap-1.5 text-sm text-gold font-semibold">
    <Star className="w-4 h-4 fill-gold text-gold" /> {hoSo.danh_gia_sao} · {hoSo.so_don_hoan_thanh} đơn hoàn thành
  </p>
  <div className="flex items-center justify-between border border-line rounded-lg px-3 py-2.5">
    <span className="text-sm text-ink">
      {dangNghi ? "🔴 Đang nghỉ" : "🟢 Đang hoạt động"}
    </span>
    {/* 1. NÚT NGHỈ / BẬT LẠI */}
    <button
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white transition ${
        dangNghi ? "bg-teal hover:opacity-90" : "bg-rust hover:opacity-90"
      }`}
      onClick={doiTrangThaiNghi}
    >
      {dangNghi ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
      {dangNghi ? "Bật lại" : "Nghỉ tạm thời"}
    </button>
  </div>
</div>

{/* 2. NÚT LƯU THAY ĐỔI */}
<button
  className="flex items-center justify-center gap-2 bg-rust hover:opacity-90 text-white px-4 py-3 rounded-xl w-full font-semibold disabled:opacity-50 transition"
  onClick={luuHoSo}
  disabled={dangLuu}
>
  <Save className="w-4 h-4" />
  {dangLuu ? "Đang lưu..." : "Lưu thay đổi"}
</button>
      </div>
    </div>
  );
}