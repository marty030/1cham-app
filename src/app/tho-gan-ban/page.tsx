"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { DANH_MUC_NGHE } from "../../lib/danhMuc";
import { layHoSoKhachHienTai, HoSoKhach } from "../../lib/khach";
import TheTho from "../../components/TheTho";
import FormThemTho from "../../components/FormThemTho";
import Link from "next/link";
import { ArrowLeft, LogOut, LogIn, UserPlus, User, ClipboardList, Settings, MessageCircle } from "lucide-react";
import { useThongBao, useXacNhan } from "../../components/ThongBao";
import { dichLoiSupabase } from "../../lib/dichLoi";
import { useDatLich } from "../../hooks/useDatLich";

function tinhKhoangCach(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function NoiDungTrangDanhSach() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const danhMucLoc = searchParams.get("danh_muc");
  const tenDanhMucLoc = DANH_MUC_NGHE.find((m) => m.gia_tri === danhMucLoc)?.nhan ?? null;

  const [viTriDangMo, setViTriDangMo] = useState<number | null>(null);
  const [daDangNhap, setDaDangNhap] = useState(false);
  const [hoSoKhach, setHoSoKhach] = useState<HoSoKhach | null>(null);
  const [viTriDatLich, setViTriDatLich] = useState<number | null>(null);
  const [laAdmin, setLaAdmin] = useState(false);
  const [viTriKhach, setViTriKhach] = useState<{ lat: number; lng: number } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const thongBao = useThongBao();
  const xacNhanHopThoai = useXacNhan();
  const duongDanHienTai = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const datLich = useDatLich({ hoSoKhach, duongDanQuayLai: duongDanHienTai, danhMuc: danhMucLoc });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (viTri) => {
        setViTriKhach({
          lat: viTri.coords.latitude,
          lng: viTri.coords.longitude,
        });
      },
      (loi) => {
        console.log("Không lấy được vị trí:", loi);
      }
    );
  }, []);

  useEffect(() => {
    async function kiemTraDangNhap() {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setDaDangNhap(true);
        setCurrentUserId(data.session.user.id);
        const role = data.session.user.user_metadata?.role;
        setLaAdmin(role === "admin");
        setHoSoKhach(await layHoSoKhachHienTai());
      } else {
        setDaDangNhap(false);
        setLaAdmin(false);
        setCurrentUserId(null);
        setHoSoKhach(null);
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
  const [danhMucMoi, setDanhMucMoi] = useState<string[]>([]);
  const [viTriDangSua, setViTriDangSua] = useState<number | null>(null);
  const [ngheSua, setNgheSua] = useState("");

  function toggleDanhMucMoi(giaTri: string) {
    setDanhMucMoi((truoc) =>
      truoc.includes(giaTri) ? truoc.filter((d) => d !== giaTri) : [...truoc, giaTri]
    );
  }

  const thoTrongBanKinh = danhSachTho.filter((tho) => {
    if (currentUserId && tho.user_id === currentUserId) return false;

    if (danhMucLoc && !(tho.danh_muc || []).includes(danhMucLoc)) return false;

    if (!viTriKhach || !tho.vi_do || !tho.kinh_do) return true;
    const khoangCach = tinhKhoangCach(viTriKhach.lat, viTriKhach.lng, tho.vi_do, tho.kinh_do);
    return khoangCach <= (tho.ban_kinh_hoat_dong ?? 10);
  });

  function moDatLich(index: number) {
    if (datLich.batDau()) setViTriDatLich(index);
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-paper py-8 px-4 sm:px-6">
      <div className="flex items-center gap-2 mb-2">
        <Link href="/" className="flex items-center gap-1 text-sm text-rust hover:underline font-medium">
          <ArrowLeft className="w-4 h-4" /> Trang chủ
        </Link>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-ink">
        {tenDanhMucLoc ? `Thợ ${tenDanhMucLoc.toLowerCase()} gần bạn` : "Thợ gần bạn"}
      </h1>
      {tenDanhMucLoc && (
        <Link href="/tho-gan-ban" className="text-sm text-ink-soft hover:text-rust mb-6 underline">
          Xem tất cả ngành
        </Link>
      )}
      {!tenDanhMucLoc && <div className="mb-6" />}

      <div className="flex flex-wrap justify-center gap-3 w-full max-w-4xl mb-10">
        {daDangNhap ? (
          <button
            className="flex items-center gap-2 bg-line hover:bg-ink-soft hover:text-white text-ink-soft transition px-5 py-2.5 rounded-xl shadow-sm font-medium"
            onClick={async () => {
              await supabase.auth.signOut();
              setDaDangNhap(false);
            }}
          >
            <LogOut className="w-4 h-4" /> Đăng xuất
          </button>
        ) : (
          <>
            <Link href="/login">
              <button className="flex items-center gap-2 bg-card hover:bg-teal-soft transition text-teal border border-teal/30 px-5 py-2.5 rounded-xl shadow-sm font-medium">
                <LogIn className="w-4 h-4" /> Đăng nhập
              </button>
            </Link>
            <Link href="/dang-ky">
              <button className="flex items-center gap-2 bg-teal hover:opacity-90 transition text-white px-5 py-2.5 rounded-xl shadow-sm font-medium">
                <UserPlus className="w-4 h-4" /> Đăng ký làm thợ
              </button>
            </Link>
            <Link href="/dang-ky-khach">
              <button className="flex items-center gap-2 bg-card hover:bg-rust-soft transition text-rust border border-rust/30 px-5 py-2.5 rounded-xl shadow-sm font-medium">
                <UserPlus className="w-4 h-4" /> Đăng ký làm khách hàng
              </button>
            </Link>
          </>
        )}

        {daDangNhap && (
          <>
            {!hoSoKhach && (
              <Link href="/ho-so">
                <button className="flex items-center gap-2 bg-teal-soft hover:opacity-80 transition text-teal px-5 py-2.5 rounded-xl shadow-sm font-medium">
                  <User className="w-4 h-4" /> Hồ sơ của tôi
                </button>
              </Link>
            )}
            <Link href={hoSoKhach ? "/don-cua-toi-khach" : "/don-cua-toi"}>
              <button className="flex items-center gap-2 bg-gold-soft hover:opacity-80 transition text-gold px-5 py-2.5 rounded-xl shadow-sm font-medium">
                <ClipboardList className="w-4 h-4" /> Đơn của tôi
              </button>
            </Link>
            {hoSoKhach && (
              <Link href="/tin-nhan-cua-toi">
                <button className="flex items-center gap-2 bg-teal-soft hover:opacity-80 transition text-teal px-5 py-2.5 rounded-xl shadow-sm font-medium">
                  <MessageCircle className="w-4 h-4" /> Tin nhắn
                </button>
              </Link>
            )}
          </>
        )}

        {laAdmin && (
          <Link href="/admin/don-dat-lich">
            <button className="flex items-center gap-2 bg-gold hover:opacity-90 transition text-white px-5 py-2.5 rounded-xl shadow-sm font-medium">
              <Settings className="w-4 h-4" /> Xem đơn đặt lịch
            </button>
          </Link>
        )}
      </div>

      {thoTrongBanKinh.length === 0 && (
        <p className="text-ink-soft mb-8">Chưa có thợ nào ở ngành này trong khu vực của bạn.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-7xl">
        {thoTrongBanKinh.map((tho, index) => {
          const dangLamViec = danhSachDon.some((don) => {
            if (don.tho_id !== tho.id || don.trang_thai !== "Đã xác nhận")
              return false;
            const gioHen = new Date(don.gio_hen);
            const bayGio = new Date();
            const chenhLechGio =
              Math.abs(gioHen.getTime() - bayGio.getTime()) / (1000 * 60 * 60);
            return chenhLechGio < 2;
          });

          const khoangCach =
            viTriKhach && tho.vi_do && tho.kinh_do
              ? tinhKhoangCach(viTriKhach.lat, viTriKhach.lng, tho.vi_do, tho.kinh_do)
              : null;

          return (
            <TheTho
              key={tho.id}
              tho={tho}
              dangLamViec={dangLamViec}
              dangNghi={tho.dang_nghi}
              khoangCach={khoangCach}
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
                const dongY = await xacNhanHopThoai("Bạn có chắc muốn ẩn thợ này?");
                if (dongY) {
                  await supabase.from("tho").update({ an_hien: false }).eq("id", tho.id);
                  layDanhSachTho();
                }
              }}
              dangDatLich={viTriDatLich === index}
              tenKhach={datLich.tenKhach}
              soDienThoai={datLich.soDienThoai}
              gioHenDayDu={datLich.gioHenDayDu}
              diaChiHen={datLich.diaChiHen}
              ghiChu={datLich.ghiChu}
              onMoDatLich={() => moDatLich(index)}
              onDoiTenKhach={datLich.setTenKhach}
              onDoiSoDienThoai={datLich.setSoDienThoai}
              onDoiGioHenDayDu={datLich.setGioHenDayDu}
              onDoiDiaChiHen={datLich.setDiaChiHen}
              onDoiGhiChu={datLich.setGhiChu}
              onXacNhanDatLich={() => datLich.xacNhan(tho, () => setViTriDatLich(null))}
              onHuyDatLich={() => {
                setViTriDatLich(null);
                datLich.huy();
              }}
              onGoiNgay={() => datLich.goiNgay(tho, () => setViTriDatLich(null))}
            />
          );
        })}
      </div>

      {laAdmin && (
        <div className="mt-12 w-full max-w-2xl bg-card p-6 rounded-2xl shadow-md border border-line">
          <h2 className="text-xl font-bold mb-4 text-center text-ink">Khu vực Admin: Thêm thợ mới</h2>
          <FormThemTho
            tenMoi={tenMoi}
            ngheMoi={ngheMoi}
            diaChiMoi={diaChiMoi}
            danhMucMoi={danhMucMoi}
            onDoiTen={(giaTri) => setTenMoi(giaTri)}
            onDoiNghe={(giaTri) => setNgheMoi(giaTri)}
            onDoiDiaChi={(giaTri) => setDiaChiMoi(giaTri)}
            onToggleDanhMuc={toggleDanhMucMoi}
            onThem={async () => {
              if (danhMucMoi.length === 0) {
                thongBao("Vui lòng chọn ít nhất 1 ngành thợ này nhận làm.", "canhbao");
                return;
              }

              const { error } = await supabase.from("tho").insert([
                { ten: tenMoi, nghe: ngheMoi, dia_chi: diaChiMoi, danh_muc: danhMucMoi },
              ]);
              if (error) {
                thongBao("Lỗi khi thêm: " + dichLoiSupabase(error.message), "loi");
              } else {
                thongBao("Thêm thợ thành công!", "thanhcong");
                layDanhSachTho();
                setTenMoi("");
                setNgheMoi("");
                setDiaChiMoi("");
                setDanhMucMoi([]);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function TrangDanhSachTho() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-paper">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rust"></div>
        </div>
      }
    >
      <NoiDungTrangDanhSach />
    </Suspense>
  );
}