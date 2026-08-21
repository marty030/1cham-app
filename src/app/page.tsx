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
const [ngayHen, setNgayHen] = useState("");
const [gioHen, setGioHen] = useState("");
const [diaChiHen, setDiaChiHen] = useState("");
const [ghiChu, setGhiChu] = useState("");
const [laAdmin, setLaAdmin] = useState(false);

useEffect(() => {
  async function kiemTraDangNhap() {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      setDaDangNhap(true);
      const role = data.session.user.user_metadata?.role;
      setLaAdmin(role === "admin");
    } else {
      setDaDangNhap(false);
      setLaAdmin(false);
    }
  }
  kiemTraDangNhap();
}, []);
  
  const [danhSachTho, setDanhSachTho] = useState<any[]>([]);
  const [danhSachDon, setDanhSachDon] = useState<any[]>([]);

useEffect(() => {
  async function layDon() {
    const { data } = await supabase.from("don_dat_lich").select("*");
    setDanhSachDon(data || []);
  }
  layDon();
}, []);

  async function layDanhSachTho() {
  const { data, error } = await supabase
    .from("tho")
    .select("*")
    .eq("an_hien", true)
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
    <div className="flex flex-col items-center min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      
      {/* 1. TIÊU ĐỀ */}
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">Thợ gần bạn</h1>

      {/* 2. KHU VỰC NÚT ĐIỀU HƯỚNG (Tách riêng biệt) */}
      <div className="flex flex-wrap justify-center gap-3 w-full max-w-4xl mb-10">
        {daDangNhap ? (
          <button
            className="bg-gray-500 hover:bg-gray-600 transition text-white px-5 py-2.5 rounded-lg shadow-sm font-medium"
            onClick={async () => {
              await supabase.auth.signOut();
              setDaDangNhap(false);
            }}
          >
            Đăng xuất
          </button>
        ) : (
          <>
            <Link href="/login">
              <button className="bg-blue-500 hover:bg-blue-600 transition text-white px-5 py-2.5 rounded-lg shadow-sm font-medium">
                Đăng nhập
              </button>
            </Link>
            <Link href="/dang-ky">
              <button className="bg-green-600 hover:bg-green-700 transition text-white px-5 py-2.5 rounded-lg shadow-sm font-medium">
                Đăng ký làm thợ
              </button>
            </Link>
          </>
        )}

        {daDangNhap && (
          <>
            <Link href="/ho-so">
              <button className="bg-teal-500 hover:bg-teal-600 transition text-white px-5 py-2.5 rounded-lg shadow-sm font-medium">
                Hồ sơ của tôi
              </button>
            </Link>
            <Link href="/don-cua-toi">
              <button className="bg-indigo-500 hover:bg-indigo-600 transition text-white px-5 py-2.5 rounded-lg shadow-sm font-medium">
                Đơn của tôi
              </button>
            </Link>
          </>
        )}

        {laAdmin && (
          <Link href="/admin/don-dat-lich">
            <button className="bg-purple-500 hover:bg-purple-600 transition text-white px-5 py-2.5 rounded-lg shadow-sm font-medium">
              Xem đơn đặt lịch
            </button>
          </Link>
        )}
      </div>

      {/* 3. DANH SÁCH THỢ (Sử dụng CSS Grid cho Responsive) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-7xl">
        {danhSachTho.map((tho, index) => {
          const dangLamViec = danhSachDon.some((don) => {
            if (don.tho_id !== tho.id || don.trang_thai !== "Đã xác nhận")
              return false;
            const gioHen = new Date(don.gio_hen);
            const bayGio = new Date();
            const chenhLechGio =
              Math.abs(gioHen.getTime() - bayGio.getTime()) / (1000 * 60 * 60);
            return chenhLechGio < 2;
          });

          return (
            <TheTho
              key={tho.id}
              tho={tho}
              dangLamViec={dangLamViec}
              dangNghi={tho.dang_nghi}
              index={index}
              dangMo={viTriDangMo === index}
              dangSua={viTriDangSua === index}
              ngheSua={ngheSua}
              daDangNhap={laAdmin}
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
                const xacNhan = confirm("Bạn có chắc muốn ẩn thợ này?");
                if (xacNhan) {
                  await supabase.from("tho").update({ an_hien: false }).eq("id", tho.id);
                  layDanhSachTho();
                }
              }}
              dangDatLich={viTriDatLich === index}
              tenKhach={tenKhach}
              soDienThoai={soDienThoai}
              ngayHen={ngayHen}
              gioHen={gioHen}
              diaChiHen={diaChiHen}
              ghiChu={ghiChu}
              onMoDatLich={() => setViTriDatLich(index)}
              onDoiTenKhach={(giaTri) => setTenKhach(giaTri)}
              onDoiSoDienThoai={(giaTri) => setSoDienThoai(giaTri)}
              onDoiNgayHen={(giaTri) => setNgayHen(giaTri)}
              onDoiGioHen={(giaTri) => setGioHen(giaTri)}
              onDoiDiaChiHen={(giaTri) => setDiaChiHen(giaTri)}
              onDoiGhiChu={(giaTri) => setGhiChu(giaTri)}
              onXacNhanDatLich={async () => {
                const { error } = await supabase.from("don_dat_lich").insert([
                  {
                    ten_khach: tenKhach,
                    so_dien_thoai: soDienThoai,
                    tho_id: tho.id,
                    gio_hen: `${ngayHen}T${gioHen}:00`,
                    dia_chi_hen: diaChiHen,
                    ghi_chu: ghiChu,
                  },
                ]);
                if (error) {
                  alert("Lỗi đặt lịch: " + error.message);
                } else {
                  alert("Đặt lịch thành công! Thợ sẽ liên hệ bạn sớm.");
                  setViTriDatLich(null);
                  setTenKhach("");
                  setSoDienThoai("");
                  setNgayHen("");
                  setGioHen("");
                  setDiaChiHen("");
                  setGhiChu("");
                }
              }}
              onHuyDatLich={() => {
                setViTriDatLich(null);
                setTenKhach("");
                setSoDienThoai("");
              }}
            />
          );
        })}
      </div>

      {/* 4. FORM THÊM THỢ CHO ADMIN */}
      {laAdmin && (
        <div className="mt-12 w-full max-w-2xl bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-center text-gray-700">Khu vực Admin: Thêm thợ mới</h2>
          <FormThemTho
            tenMoi={tenMoi}
            ngheMoi={ngheMoi}
            diaChiMoi={diaChiMoi}
            onDoiTen={(giaTri) => setTenMoi(giaTri)}
            onDoiNghe={(giaTri) => setNgheMoi(giaTri)}
            onDoiDiaChi={(giaTri) => setDiaChiMoi(giaTri)}
            onThem={async () => {
              const { error } = await supabase.from("tho").insert([
                { ten: tenMoi, nghe: ngheMoi, dia_chi: diaChiMoi },
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
        </div>
      )}
    </div>
  );
}