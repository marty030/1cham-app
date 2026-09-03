"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { DANH_MUC_NGHE } from "../../lib/danhMuc";
import TheTho from "../../components/TheTho";
import FormThemTho from "../../components/FormThemTho";
import Link from "next/link";

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

async function taoDonVaLayLink(supabaseClient: any, duLieuDon: any): Promise<{ thanhCong: boolean; link: string | null }> {
  const { data, error } = await supabaseClient
    .from("don_dat_lich")
    .insert([duLieuDon])
    .select()
    .single();

  if (!error && data) {
    return { thanhCong: true, link: `${window.location.origin}/don/${data.id}` };
  }

  console.error("Insert don_dat_lich - lỗi hoặc không lấy lại được dòng vừa tạo:", error);

  const { data: donDuPhong, error: loiDuPhong } = await supabaseClient
    .from("don_dat_lich")
    .select("id")
    .eq("so_dien_thoai", duLieuDon.so_dien_thoai)
    .eq("tho_id", duLieuDon.tho_id)
    .eq("gio_hen", duLieuDon.gio_hen)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (loiDuPhong || !donDuPhong) {
    console.error("Phương án dự phòng cũng thất bại (có thể insert đã thất bại thật sự):", loiDuPhong);
    return { thanhCong: false, link: null };
  }

  return { thanhCong: true, link: `${window.location.origin}/don/${donDuPhong.id}` };
}

function NoiDungTrangDanhSach() {
  const searchParams = useSearchParams();
  const danhMucLoc = searchParams.get("danh_muc");
  const tenDanhMucLoc = DANH_MUC_NGHE.find((m) => m.gia_tri === danhMucLoc)?.nhan ?? null;

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
  const [viTriKhach, setViTriKhach] = useState<{ lat: number; lng: number } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [linkDonMoiTao, setLinkDonMoiTao] = useState<string | null>(null);

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
      } else {
        setDaDangNhap(false);
        setLaAdmin(false);
        setCurrentUserId(null);
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

  return (
    <div className="flex flex-col items-center min-h-screen bg-paper py-8 px-4 sm:px-6">
      <div className="flex items-center gap-2 mb-2">
        <Link href="/" className="text-sm text-rust hover:underline font-medium">
          ← Trang chủ
        </Link>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold mb-2 text-ink">
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
            className="bg-line hover:bg-ink-soft hover:text-white text-ink-soft transition px-5 py-2.5 rounded-xl shadow-sm font-medium"
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
              <button className="bg-card hover:bg-teal-soft transition text-teal border border-teal/30 px-5 py-2.5 rounded-xl shadow-sm font-medium">
                Đăng nhập
              </button>
            </Link>
            <Link href="/dang-ky">
              <button className="bg-teal hover:opacity-90 transition text-white px-5 py-2.5 rounded-xl shadow-sm font-medium">
                Đăng ký làm thợ
              </button>
            </Link>
            <Link href="/dang-ky-khach">
              <button className="bg-card hover:bg-rust-soft transition text-rust border border-rust/30 px-5 py-2.5 rounded-xl shadow-sm font-medium">
                Đăng ký làm khách hàng
              </button>
            </Link>
          </>
        )}

        {daDangNhap && (
          <>
            <Link href="/ho-so">
              <button className="bg-teal-soft hover:opacity-80 transition text-teal px-5 py-2.5 rounded-xl shadow-sm font-medium">
                Hồ sơ của tôi
              </button>
            </Link>
            <Link href="/don-cua-toi">
              <button className="bg-gold-soft hover:opacity-80 transition text-gold px-5 py-2.5 rounded-xl shadow-sm font-medium">
                Đơn của tôi
              </button>
            </Link>
          </>
        )}

        {laAdmin && (
          <Link href="/admin/don-dat-lich">
            <button className="bg-gold hover:opacity-90 transition text-white px-5 py-2.5 rounded-xl shadow-sm font-medium">
              Xem đơn đặt lịch
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
                const { thanhCong, link } = await taoDonVaLayLink(supabase, {
                  ten_khach: tenKhach,
                  so_dien_thoai: soDienThoai,
                  tho_id: tho.id,
                  gio_hen: `${ngayHen}T${gioHen}:00`,
                  dia_chi_hen: diaChiHen,
                  ghi_chu: ghiChu,
                  danh_muc: danhMucLoc,
                });

                if (!thanhCong) {
                  alert("Đặt lịch thất bại, vui lòng thử lại. (Chi tiết lỗi xem ở Console - F12)");
                  return;
                }

                if (link) {
                  navigator.clipboard.writeText(link).catch(() => {});
                  setLinkDonMoiTao(link);
                } else {
                  alert("Đặt lịch thành công nhưng không lấy được link đơn. Vui lòng nhờ thợ gửi lại link sau.");
                }

                setViTriDatLich(null);
                setTenKhach("");
                setSoDienThoai("");
                setNgayHen("");
                setGioHen("");
                setDiaChiHen("");
                setGhiChu("");
              }}
              onHuyDatLich={() => {
                setViTriDatLich(null);
                setTenKhach("");
                setSoDienThoai("");
              }}
              onGoiNgay={async () => {
                if (!tenKhach || !soDienThoai || !diaChiHen) {
                  alert("Vui lòng điền đủ họ tên, số điện thoại và địa chỉ trước khi gọi.");
                  return;
                }

                const duLieuDon = {
                  ten_khach: tenKhach,
                  so_dien_thoai: soDienThoai,
                  tho_id: tho.id,
                  gio_hen: new Date().toISOString(),
                  dia_chi_hen: diaChiHen,
                  ghi_chu: ghiChu,
                  trang_thai: "Chờ xác nhận",
                  danh_muc: danhMucLoc,
                };

                const { thanhCong, link } = await taoDonVaLayLink(supabase, duLieuDon);

                if (!thanhCong) {
                  alert("Tạo đơn thất bại, vui lòng thử lại. (Chi tiết lỗi xem ở Console - F12)");
                  return;
                }

                if (link) {
                  navigator.clipboard.writeText(link).catch(() => {});
                  setLinkDonMoiTao(link);
                } else {
                  alert("Đã tạo đơn nhưng không lấy được link. Vui lòng nhờ thợ gửi lại link sau.");
                }

                setViTriDatLich(null);
                setTenKhach("");
                setSoDienThoai("");
                setDiaChiHen("");
                setGhiChu("");

                if (!tho.so_dien_thoai) {
                  alert("Đã tạo yêu cầu! Thợ này chưa cập nhật số điện thoại, vui lòng chờ thợ liên hệ lại.");
                } else {
                  const soSach = tho.so_dien_thoai.replace(/\D/g, "");
                  window.open(`https://zalo.me/${soSach}`, "_blank");
                }
              }}
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
                alert("Vui lòng chọn ít nhất 1 ngành thợ này nhận làm.");
                return;
              }

              const { error } = await supabase.from("tho").insert([
                { ten: tenMoi, nghe: ngheMoi, dia_chi: diaChiMoi, danh_muc: danhMucMoi },
              ]);
              if (error) {
                alert("Lỗi khi thêm: " + error.message);
              } else {
                alert("Thêm thợ thành công!");
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

      {linkDonMoiTao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-ink">✅ Đặt lịch thành công!</h3>
            <p className="text-sm text-ink-soft">
              Lưu link này lại để xem trạng thái đơn, xác nhận hoàn thành và đánh giá thợ sau này.
              Link đã được tự động copy vào clipboard.
            </p>
            <div className="bg-paper border border-line rounded-lg px-3 py-2 text-sm text-ink-soft break-all font-mono">
              {linkDonMoiTao}
            </div>
            <div className="flex gap-2">
              <a
                href={linkDonMoiTao}
                className="flex-1 text-center bg-rust hover:opacity-90 text-white font-semibold py-2.5 rounded-lg transition-colors"
              >
                Mở trang đơn
              </a>
              <button
                onClick={() => setLinkDonMoiTao(null)}
                className="flex-1 bg-line hover:bg-ink-soft hover:text-white text-ink-soft font-semibold py-2.5 rounded-lg transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
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