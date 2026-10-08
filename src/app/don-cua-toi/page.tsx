"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import ChonKhungGio from "../../components/ChonKhungGio";
import KhoiLichHen, { dinhDangGioNgan } from "../../components/KhoiLichHen";
import ThanhHaiBuoc from "../../components/ThanhHaiBuoc";
import NutBaoVanDe from "../../components/NutBaoVanDe";
import NhacDonBoQuen, { type MucNhac } from "../../components/NhacDonBoQuen";
import { gioPhutVN, taoISOTuVN, TUY_CHON_GIO_VN } from "../../lib/thoiGianVN";
import { daToiGioHen, nhanMoKhoa, layNhacDon } from "../../lib/gioHen";
import {
  ClipboardList,
  Phone,
  Car,
  StickyNote,
  Hourglass,
  CheckCircle2,
  XCircle,
  PencilLine,
  Lock,
} from "lucide-react";
import { useThongBao, useXacNhan } from "../../components/ThongBao";
import { dichLoiSupabase } from "../../lib/dichLoi";

export default function DonCuaToi() {
  const [danhSachDon, setDanhSachDon] = useState<any[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [boLoc, setBoLoc] = useState("Tất cả");
  const router = useRouter();
  const thongBao = useThongBao();
  const xacNhanHopThoai = useXacNhan();

  const [donDangXacNhan, setDonDangXacNhan] = useState<number | null>(null);
  const [gioDenDuKienDayDu, setGioDenDuKienDayDu] = useState("");
  const [thoIdCuaToi, setThoIdCuaToi] = useState<number | null>(null);
  // Đơn nào đang có báo cáo vấn đề chờ admin (do NutBaoVanDe báo lên) → khóa nút hoàn thành
  const [donCoBaoCao, setDonCoBaoCao] = useState<Record<number, boolean>>({});
  // Đơn đang được làm nổi bật sau khi bấm "Xem đơn" ở khung nhắc
  const [donNoiBat, setDonNoiBat] = useState<number | null>(null);

  async function taiDonCuaTho(thoId: number) {
    const { data, error } = await supabase
      .from("don_dat_lich")
      .select("*")
      .eq("tho_id", thoId)
      .order("id", { ascending: false });

    if (error) {
      console.log("Lỗi:", error);
    } else {
      setDanhSachDon(data);
    }
  }

  useEffect(() => {
    async function layDon() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push("/login");
        return;
      }

      const { data: hoSo } = await supabase
        .from("tho")
        .select("id")
        .eq("user_id", sessionData.session.user.id)
        .single();

      if (!hoSo) {
        setDangTai(false);
        return;
      }

      setThoIdCuaToi(hoSo.id);
      await taiDonCuaTho(hoSo.id);
      setDangTai(false);
    }
    layDon();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Vì đơn "Chờ xác nhận" không còn khóa khung giờ, 2 khách có thể cùng đặt một khung.
  // Trước khi thợ xác nhận, kiểm tra thợ đã xác nhận đơn nào khác trong cùng khung 30 phút chưa
  // (làm tròn giống ChonKhungGio). Nếu truy vấn lỗi thì cho qua, không chặn thợ.
  async function daCoDonKhacDaXacNhanCungKhung(don: any): Promise<boolean> {
    const { gio, phut } = gioPhutVN(don.gio_hen);
    const ngay = new Date(don.gio_hen).toLocaleDateString("en-CA", TUY_CHON_GIO_VN);
    const phutTron = Math.floor((gio * 60 + phut) / 30) * 30;
    const hh = String(Math.floor(phutTron / 60)).padStart(2, "0");
    const mm = String(phutTron % 60).padStart(2, "0");
    const batDau = taoISOTuVN(ngay, `${hh}:${mm}`);
    // Mốc kết thúc cũng ghi theo giờ VN (+07:00), KHÔNG dùng toISOString() (giờ UTC): cột gio_hen
    // lưu giờ VN không múi giờ nên hậu tố "Z" của UTC sẽ bị bỏ và mốc lệch mất 7 tiếng.
    const phutKet = Math.min(phutTron + 30, 24 * 60 - 1);
    const ketThuc = taoISOTuVN(
      ngay,
      `${String(Math.floor(phutKet / 60)).padStart(2, "0")}:${String(phutKet % 60).padStart(2, "0")}`
    );

    const { data, error } = await supabase
      .from("don_dat_lich")
      .select("id")
      .eq("tho_id", don.tho_id)
      .in("trang_thai", ["Đã xác nhận", "Đã hoàn thành"])
      .neq("id", don.id)
      .gte("gio_hen", batDau)
      .lt("gio_hen", ketThuc)
      .limit(1);

    if (error) {
      console.error("Lỗi kiểm tra trùng khung giờ:", error);
      return false;
    }
    return (data?.length ?? 0) > 0;
  }

  // Gửi lệnh "Đã xác nhận" kèm điều kiện chống xác nhận trên dữ liệu cũ: chỉ cập nhật nếu
  // đơn vẫn đang "Chờ xác nhận" VÀ giờ hẹn + địa chỉ vẫn đúng như thợ đang nhìn thấy.
  // Nếu khách vừa sửa đơn (hoặc hủy) thì không dòng nào khớp → báo thợ và tải lại.
  async function guiXacNhanDon(don: any, themCot: Record<string, any>): Promise<boolean> {
    const truyVan = supabase
      .from("don_dat_lich")
      .update({ trang_thai: "Đã xác nhận", ...themCot })
      .eq("id", don.id)
      .eq("trang_thai", "Chờ xác nhận")
      .eq("gio_hen", don.gio_hen)
      .eq("dia_chi_hen", don.dia_chi_hen);

    const { data, error } = await truyVan.select();

    if (error) {
      thongBao("Lỗi: " + dichLoiSupabase(error.message), "loi");
      return false;
    }
    if (!data || data.length === 0) {
      thongBao(
        "Khách vừa chỉnh sửa hoặc hủy đơn này. Danh sách đã được tải lại — hãy xem lại giờ hẹn và địa chỉ rồi xác nhận.",
        "canhbao"
      );
      if (thoIdCuaToi) await taiDonCuaTho(thoIdCuaToi);
      setDonDangXacNhan(null);
      return false;
    }
    setDanhSachDon((truoc) => truoc.map((d) => (d.id === don.id ? { ...d, ...data[0] } : d)));
    return true;
  }

  async function xacNhanDon(don: any) {
    if (don.che_do_dat_lich === "gio_khac") {
      if (await daCoDonKhacDaXacNhanCungKhung(don)) {
        thongBao(
          "Bạn đã xác nhận một đơn khác vào khung giờ này. Hãy không nhận đơn này hoặc liên hệ khách để đổi giờ.",
          "canhbao"
        );
        return;
      }
      await guiXacNhanDon(don, {});
      return;
    }

    // Đơn "gọi ngay": thợ cần nhập giờ dự kiến đến trước khi xác nhận
    setDonDangXacNhan(don.id);
    setGioDenDuKienDayDu("");
  }

  async function xacNhanKemGioDen(don: any) {
    if (!gioDenDuKienDayDu) {
      thongBao("Vui lòng chọn ngày và giờ dự kiến đến.", "canhbao");
      return;
    }
    const thanhCong = await guiXacNhanDon(don, { gio_du_kien_den: gioDenDuKienDayDu });
    if (thanhCong) setDonDangXacNhan(null);
  }

  async function thoXacNhanHoanThanh(don: any) {
    if (!daToiGioHen(don.gio_hen)) {
      thongBao(`Chưa đến giờ hẹn, bạn có thể xác nhận hoàn thành từ ${nhanMoKhoa(don.gio_hen)}.`, "canhbao");
      return;
    }

    const dongY = await xacNhanHopThoai(
      "Xác nhận bạn đã hoàn thành công việc này? Bạn không thể rút lại. Đơn chỉ chính thức hoàn thành khi khách cũng xác nhận."
    );
    if (!dongY) return;

    const { data: donMoiNhat, error: loiLayDon } = await supabase
      .from("don_dat_lich")
      .select("khach_xac_nhan_hoan_thanh")
      .eq("id", don.id)
      .single();

    if (loiLayDon || !donMoiNhat) {
      thongBao("Không lấy được dữ liệu đơn, thử lại.", "loi");
      return;
    }

    const khachDaXacNhan = donMoiNhat.khach_xac_nhan_hoan_thanh === true;

    const capNhat: any = { tho_xac_nhan_hoan_thanh: true };
    if (khachDaXacNhan) {
      capNhat.trang_thai = "Đã hoàn thành";
    }

    // Hiển thị theo CHÍNH dòng database trả về (database cũng tự chuyển "Đã hoàn thành" khi đủ hai bên)
    const { data, error } = await supabase
      .from("don_dat_lich")
      .update(capNhat)
      .eq("id", don.id)
      .select("*");

    if (error || !data || data.length === 0) {
      thongBao("Lỗi: " + dichLoiSupabase(error?.message), "loi");
    } else {
      const donMoi = data[0];
      setDanhSachDon((truoc) => truoc.map((d) => (d.id === don.id ? { ...d, ...donMoi } : d)));
      thongBao(
        donMoi.trang_thai === "Đã hoàn thành"
          ? "Đơn đã hoàn thành!"
          : "Đã ghi nhận bạn hoàn thành. Đơn sẽ chuyển 'Đã hoàn thành' khi khách cũng xác nhận.",
        "thanhcong"
      );
    }
  }

  // Bấm "Xem đơn" ở khung nhắc: về tab "Tất cả" (để thẻ chắc chắn đang hiện), cuộn tới thẻ và làm nổi bật ít giây
  function nhayToiDon(id: number) {
    setBoLoc("Tất cả");
    setTimeout(() => {
      document.getElementById(`don-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      setDonNoiBat(id);
      setTimeout(() => setDonNoiBat(null), 2500);
    }, 80);
  }

  // Dùng cho cả "Không nhận đơn" (đơn Chờ xác nhận) và "Hủy đơn" (đơn Đã xác nhận)
  async function huyDon(don: any) {
    const daXacNhan = don.trang_thai === "Đã xác nhận";
    const dongY = await xacNhanHopThoai(
      daXacNhan
        ? "Hủy đơn đã xác nhận? Khách đã sắp xếp lịch theo đơn này — nên liên hệ khách trước nếu có thể. Không thể hoàn tác."
        : "Không nhận đơn này? Khách sẽ thấy đơn chuyển sang Đã hủy, không thể hoàn tác."
    );
    if (!dongY) return;

    const { error } = await supabase
      .from("don_dat_lich")
      .update({ trang_thai: "Đã hủy" })
      .eq("id", don.id);

    if (error) {
      thongBao("Lỗi: " + dichLoiSupabase(error.message), "loi");
    } else {
      setDanhSachDon((truoc) =>
        truoc.map((d) => (d.id === don.id ? { ...d, trang_thai: "Đã hủy" } : d))
      );
      thongBao(daXacNhan ? "Đã hủy đơn." : "Đã từ chối đơn.", "thanhcong");
    }
  }

  const danhSachHienThi = danhSachDon.filter((don) => {
    if (boLoc === "Tất cả") return true;
    return don.trang_thai === boLoc;
  });

  const mucNhac: MucNhac[] = [];
  for (const don of danhSachDon) {
    const noiDung = layNhacDon(don, "tho");
    if (noiDung) {
      mucNhac.push({
        id: don.id,
        tieuDe: `${don.ten_khach} · ${dinhDangGioNgan(don.gio_hen)}`,
        noiDung,
      });
    }
  }

  if (dangTai) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rust"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-6 flex items-center gap-2">
          <ClipboardList className="w-6 h-6" /> Đơn đặt lịch của tôi
        </h1>

        <NhacDonBoQuen muc={mucNhac} onChon={nhayToiDon} />

        <div className="flex flex-wrap gap-2 mb-8 bg-card p-2 rounded-2xl shadow-sm border border-line">
          {["Tất cả", "Chờ xác nhận", "Đã xác nhận", "Đã hoàn thành", "Đã hủy"].map((trangThaiTab) => {
            const soLuong =
              trangThaiTab === "Tất cả"
                ? danhSachDon.length
                : danhSachDon.filter((d) => d.trang_thai === trangThaiTab).length;

            return (
              <button
                key={trangThaiTab}
                onClick={() => setBoLoc(trangThaiTab)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  boLoc === trangThaiTab
                    ? "bg-rust text-white shadow-sm"
                    : "bg-paper text-ink-soft hover:bg-line"
                }`}
              >
                <span>{trangThaiTab}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    boLoc === trangThaiTab ? "bg-white/25 text-white" : "bg-line text-ink-soft"
                  }`}
                >
                  {soLuong}
                </span>
              </button>
            );
          })}
        </div>

        {danhSachHienThi.length === 0 ? (
          <div className="bg-card p-12 rounded-2xl shadow-sm text-center border border-line">
            <p className="text-ink-soft text-lg">Không có đơn hàng nào ở trạng thái này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {danhSachHienThi.map((don) => {
              const daToiGio = daToiGioHen(don.gio_hen);
              const thoDaBam = don.tho_xac_nhan_hoan_thanh === true;
              const khachDaBam = don.khach_xac_nhan_hoan_thanh === true;
              const coBaoCao = donCoBaoCao[don.id] === true;

              return (
                <div
                  key={don.id}
                  id={`don-${don.id}`}
                  className={`bg-card border border-line rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden ${
                    donNoiBat === don.id ? "ring-2 ring-gold" : ""
                  }`}
                >
                  <div className="bg-paper px-5 py-4 border-b border-line flex justify-between items-center">
                    <div>
                      <p className="text-sm text-ink-soft font-medium mb-1">Khách hàng</p>
                      <h3 className="text-lg font-bold text-ink line-clamp-1">{don.ten_khach}</h3>
                    </div>
                    <a
                      href={`tel:${don.so_dien_thoai}`}
                      className="bg-teal-soft text-teal p-2.5 rounded-full hover:opacity-80 transition-colors shrink-0 flex items-center justify-center"
                      title="Gọi ngay"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="p-5 flex-1 flex flex-col gap-3 text-sm text-ink-soft">
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-ink-soft shrink-0" />
                      <span className="text-base font-semibold text-ink tabular-nums">
                        {don.so_dien_thoai}
                      </span>
                    </div>

                    {don.trang_thai === "Chờ xác nhận" && don.chinh_sua_luc && (
                      <div className="flex items-start gap-2.5 bg-gold-soft p-2.5 rounded-lg border border-gold/30">
                        <PencilLine className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                        <span className="text-gold font-semibold">
                          Khách đã chỉnh sửa đơn lúc{" "}
                          {new Date(don.chinh_sua_luc).toLocaleString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                            ...TUY_CHON_GIO_VN,
                          })}{" "}
                          — hãy xem lại giờ hẹn và địa chỉ.
                        </span>
                      </div>
                    )}

                    <KhoiLichHen
                      gioHen={don.gio_hen}
                      diaChi={don.dia_chi_hen}
                      nhanGio="Khách hẹn lúc"
                      gioiHanDong
                    />

                    {don.gio_du_kien_den && (
                      <div className="flex items-start gap-2.5 bg-teal-soft p-2.5 rounded-lg border border-teal/20">
                        <Car className="w-4 h-4 text-teal mt-0.5 shrink-0" />
                        <span className="text-teal font-semibold">
                          Bạn dự kiến đến: {dinhDangGioNgan(don.gio_du_kien_den)}
                        </span>
                      </div>
                    )}

                    {don.ghi_chu && (
                      <div className="flex items-start gap-2.5 bg-gold-soft p-3 rounded-lg border border-gold/20 mt-2">
                        <StickyNote className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                        <span className="text-ink-soft italic line-clamp-3">{don.ghi_chu}</span>
                      </div>
                    )}

                    {(don.trang_thai === "Đã xác nhận" || don.trang_thai === "Đã hoàn thành") && (
                      <ThanhHaiBuoc
                        thoXacNhan={thoDaBam || don.trang_thai === "Đã hoàn thành"}
                        khachXacNhan={khachDaBam || don.trang_thai === "Đã hoàn thành"}
                        vaiTro="tho"
                      />
                    )}
                  </div>

                  {/* ---------- KHU NÚT HÀNH ĐỘNG THEO TRẠNG THÁI ---------- */}
                  {donDangXacNhan === don.id ? (
                    <div className="p-5 pt-0 mt-auto flex flex-col gap-2 bg-teal-soft border-t border-teal/20">
                      <p className="text-xs font-semibold text-teal mt-3">Dự kiến bạn đến lúc nào?</p>
                      <ChonKhungGio
                        value={gioDenDuKienDayDu}
                        onChange={setGioDenDuKienDayDu}
                        thoId={thoIdCuaToi ?? undefined}
                        boQuaDonId={don.id}
                      />
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => xacNhanKemGioDen(don)}
                          className="flex-1 bg-teal hover:opacity-90 text-white py-2 rounded-lg text-sm font-semibold transition"
                        >
                          Xác nhận
                        </button>
                        <button
                          onClick={() => setDonDangXacNhan(null)}
                          className="bg-line hover:bg-ink-soft hover:text-white text-ink-soft px-3 py-2 rounded-lg text-sm transition"
                        >
                          Đóng
                        </button>
                      </div>
                    </div>
                  ) : don.trang_thai === "Chờ xác nhận" ? (
                    <div className="p-5 pt-0 mt-auto flex flex-col gap-2">
                      <button
                        onClick={() => xacNhanDon(don)}
                        className="w-full flex items-center justify-center gap-2 bg-teal hover:opacity-90 text-white font-semibold py-3 rounded-xl shadow-sm transition"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Xác nhận đơn
                      </button>
                      <button
                        onClick={() => huyDon(don)}
                        className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-ink-soft border border-line hover:bg-rust-soft hover:text-rust hover:border-rust/30 py-2 rounded-lg transition"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Không nhận đơn
                      </button>
                    </div>
                  ) : don.trang_thai === "Đã xác nhận" ? (
                    <div className="p-5 pt-0 mt-auto flex flex-col gap-2">
                      {thoDaBam ? (
                        <div className="w-full flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border bg-teal-soft text-teal border-teal/20">
                          <Hourglass className="w-4 h-4" /> Đang chờ khách xác nhận
                        </div>
                      ) : !daToiGio ? (
                        <button
                          disabled
                          className="w-full flex items-center justify-center gap-2 bg-line text-ink-soft font-semibold py-3 rounded-xl cursor-not-allowed"
                        >
                          <Lock className="w-4 h-4" /> Có thể xác nhận hoàn thành từ{" "}
                          {nhanMoKhoa(don.gio_hen)}
                        </button>
                      ) : coBaoCao ? (
                        <button
                          disabled
                          className="w-full flex items-center justify-center gap-2 bg-line text-ink-soft font-semibold py-3 rounded-xl cursor-not-allowed"
                        >
                          <Lock className="w-4 h-4" /> Tạm khóa — đang có báo cáo vấn đề
                        </button>
                      ) : (
                        <button
                          onClick={() => thoXacNhanHoanThanh(don)}
                          className="w-full flex items-center justify-center gap-2 bg-teal hover:opacity-90 text-white font-semibold py-3 rounded-xl shadow-sm transition"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Xác nhận hoàn thành
                        </button>
                      )}

                      <NutBaoVanDe
                        don={don}
                        onDoiCoBaoCao={(coBC) =>
                          setDonCoBaoCao((truoc) =>
                            truoc[don.id] === coBC ? truoc : { ...truoc, [don.id]: coBC }
                          )
                        }
                      />

                      <button
                        onClick={() => huyDon(don)}
                        className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-ink-soft border border-line hover:bg-rust-soft hover:text-rust hover:border-rust/30 py-2 rounded-lg transition"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Hủy đơn
                      </button>
                    </div>
                  ) : don.trang_thai === "Đã hoàn thành" ? (
                    <div className="p-5 pt-0 mt-auto flex flex-col gap-2">
                      <div className="w-full flex items-center justify-center gap-2 font-semibold px-4 py-2.5 rounded-xl border bg-teal text-white border-teal">
                        <CheckCircle2 className="w-4 h-4" /> Đã hoàn thành
                      </div>
                      <NutBaoVanDe don={don} />
                    </div>
                  ) : (
                    <div className="p-5 pt-0 mt-auto">
                      <div className="w-full flex items-center justify-center gap-2 font-semibold px-4 py-2.5 rounded-xl border bg-rust-soft text-rust border-rust/30">
                        <XCircle className="w-4 h-4" /> Đã hủy
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}