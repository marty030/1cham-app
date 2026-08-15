"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import TheTho from "../components/TheTho";
import FormThemTho from "../components/FormThemTho";
import Link from "next/link";
export default function Home() {
  const [viTriDangMo, setViTriDangMo] = useState<number | null>(null);
  const [daDangNhap, setDaDangNhap] = useState(false);
  const [viTriDatLich, setViTriDatLich] = useState<number | null>(null);
const [tenKhach, setTenKhach] = useState("");
const [soDienThoai, setSoDienThoai] = useState("");

useEffect(() => {
  async function kiemTraDangNhap() {
    const { data } = await supabase.auth.getSession();
    setDaDangNhap(!!data.session);
  }
  kiemTraDangNhap();
}, []);
  
  const [danhSachTho, setDanhSachTho] = useState<any[]>([]);

  async function layDanhSachTho() {
  const { data, error } = await supabase
    .from("tho")
    .select("*")
    .order("danh_gia_sao", { ascending: false });
  if (error) {
    console.log("Lỗi:", error);
  } else {
    setDanhSachTho(data);
  }
}


  
  useEffect(() => {
  layDanhSachTho();
}, []);

  const [tenMoi, setTenMoi] = useState("");

  const [ngheMoi, setNgheMoi] = useState("");

  const [diaChiMoi, setDiaChiMoi] = useState("");
  const [viTriDangSua, setViTriDangSua] = useState<number | null>(null);
  const [ngheSua, setNgheSua] = useState("");
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <h1 className="text-3xl font-bold mb-6">Thợ gần bạn</h1>
      <div className="flex flex-wrap gap-4 justify-center">

   {daDangNhap ? (
  <button
    className="bg-gray-500 text-white px-4 py-2 rounded-lg mb-4"
    onClick={async () => {
      await supabase.auth.signOut();
      setDaDangNhap(false);
    }}
  >
    Đăng xuất
  </button>
) : (
  <Link href="/login">
    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-4">
      Đăng nhập
    </button>
  </Link>
)}
{daDangNhap && (
  <Link href="/admin/don-dat-lich">
    <button className="bg-purple-500 text-white px-4 py-2 rounded-lg mb-4 ml-2">
      Xem đơn đặt lịch
    </button>
  </Link>
)}


      {danhSachTho.map((tho, index) => (
  <TheTho
    key={tho.id}
    tho={tho}
    index={index}
    dangMo={viTriDangMo === index}
    dangSua={viTriDangSua === index}
    ngheSua={ngheSua}
    daDangNhap={daDangNhap}
    onXemChiTiet={() => setViTriDangMo(viTriDangMo === index ? null : index)}
    onBatDauSua={() => {
      setViTriDangSua(index);
      setNgheSua(tho.nghe);
    }}
    onDoiNgheSua={(giaTri) => setNgheSua(giaTri)}
    onLuuSua={async () => {
      await supabase.from("tho").update({ nghe: ngheSua }).eq("id", tho.id);
      setViTriDangSua(null);
      layDanhSachTho();
    }}
    onXoa={async () => {
      const xacNhan = confirm("Bạn có chắc muốn xóa thợ này?");
      if (xacNhan) {
        await supabase.from("tho").delete().eq("id", tho.id);
        layDanhSachTho();
      }
    }}
    dangDatLich={viTriDatLich === index}
tenKhach={tenKhach}
soDienThoai={soDienThoai}
onMoDatLich={() => setViTriDatLich(index)}
onDoiTenKhach={(giaTri) => setTenKhach(giaTri)}
onDoiSoDienThoai={(giaTri) => setSoDienThoai(giaTri)}
onXacNhanDatLich={async () => {
  const { error } = await supabase.from("don_dat_lich").insert([
    {
      ten_khach: tenKhach,
      so_dien_thoai: soDienThoai,
      tho_id: tho.id,
      gio_hen: new Date().toISOString(),
    },
  ]);
  if (error) {
    alert("Lỗi đặt lịch: " + error.message);
  } else {
    alert("Đặt lịch thành công! Thợ sẽ liên hệ bạn sớm.");
    setViTriDatLich(null);
    setTenKhach("");
    setSoDienThoai("");
  }
}}
onHuyDatLich={() => {
  setViTriDatLich(null);
  setTenKhach("");
  setSoDienThoai("");
}}
  />
))}
</div>
          
  {daDangNhap && (    
  <FormThemTho
  tenMoi={tenMoi}
  ngheMoi={ngheMoi}
  diaChiMoi={diaChiMoi}
  onDoiTen={(giaTri) => setTenMoi(giaTri)}
  onDoiNghe={(giaTri) => setNgheMoi(giaTri)}
  onDoiDiaChi={(giaTri) => setDiaChiMoi(giaTri)}
  onThem={async () => {
    const { error } = await supabase.from("tho").insert([
      { ten: tenMoi, nghe: ngheMoi, dia_chi: diaChiMoi }
    ]);
    if (error) {
      alert("Lỗi khi thêm: " + error.message);
    } else {
      alert("Thêm thợ thành công!");
      layDanhSachTho();
      setTenMoi("");
      setNgheMoi("");
      setDiaChiMoi("");
    }
  }} 
/>
)}
</div>
  );
}