"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import TheTho from "../components/TheTho";
import FormThemTho from "../components/FormThemTho";
import Link from "next/link";
export default function Home() {
  const [viTriDangMo, setViTriDangMo] = useState<number | null>(null);
  const [daDangNhap, setDaDangNhap] = useState(false);

useEffect(() => {
  async function kiemTraDangNhap() {
    const { data } = await supabase.auth.getSession();
    setDaDangNhap(!!data.session);
  }
  kiemTraDangNhap();
}, []);
  
  const [danhSachTho, setDanhSachTho] = useState<any[]>([]);

  async function layDanhSachTho() {
    const { data, error } = await supabase.from("tho").select("*").order("id", { ascending: true })
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Thợ gần bạn</h1>
      <div className="flex gap-4">
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