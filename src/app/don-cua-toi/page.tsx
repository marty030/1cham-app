"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function DonCuaToi() {
  const [danhSachDon, setDanhSachDon] = useState<any[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [boLoc, setBoLoc] = useState("Tất cả");
  const router = useRouter();

  const [donDangXacNhan, setDonDangXacNhan] = useState<number | null>(null);
  const [ngayDenDuKien, setNgayDenDuKien] = useState("");
  const [gioDenDuKien, setGioDenDuKien] = useState("");

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

      const { data, error } = await supabase
        .from("don_dat_lich")
        .select("*")
        .eq("tho_id", hoSo.id)
        .order("id", { ascending: false });

      if (error) {
        console.log("Lỗi:", error);
      } else {
        setDanhSachDon(data);
      }
      setDangTai(false);
    }
    layDon();
  }, []);

  async function doiTrangThai(idDon: number, trangThaiMoi: string) {
    if (trangThaiMoi === "Đã xác nhận") {
      setDonDangXacNhan(idDon);
      setNgayDenDuKien("");
      setGioDenDuKien("");
      return;
    }

    if (trangThaiMoi === "Đã hoàn thành") {
      await thoXacNhanHoanThanh(idDon);
      return;
    }

    const { error } = await supabase
      .from("don_dat_lich")
      .update({ trang_thai: trangThaiMoi })
      .eq("id", idDon);
    if (error) {
      alert("Lỗi: " + error.message);
    } else {
      setDanhSachDon((truoc) =>
        truoc.map((d) => (d.id === idDon ? { ...d, trang_thai: trangThaiMoi } : d))
      );
    }
  }

  async function thoXacNhanHoanThanh(idDon: number) {
    const { data: donMoiNhat, error: loiLayDon } = await supabase
      .from("don_dat_lich")
      .select("khach_xac_nhan_hoan_thanh")
      .eq("id", idDon)
      .single();

    if (loiLayDon || !donMoiNhat) {
      alert("Không lấy được dữ liệu đơn, thử lại.");
      return;
    }

    const khachDaXacNhan = donMoiNhat.khach_xac_nhan_hoan_thanh === true;

    const capNhat: any = { tho_xac_nhan_hoan_thanh: true };
    if (khachDaXacNhan) {
      capNhat.trang_thai = "Đã hoàn thành";
    }

    const { error } = await supabase
      .from("don_dat_lich")
      .update(capNhat)
      .eq("id", idDon);

    if (error) {
      alert("Lỗi: " + error.message);
    } else {
      setDanhSachDon((truoc) =>
        truoc.map((d) => (d.id === idDon ? { ...d, ...capNhat } : d))
      );
      if (!khachDaXacNhan) {
        alert("Đã ghi nhận bạn hoàn thành. Đơn sẽ chuyển 'Đã hoàn thành' khi khách cũng xác nhận.");
      }
    }
  }

  function copyLinkChoKhach(idDon: number) {
    const link = `${window.location.origin}/don/${idDon}`;
    navigator.clipboard.writeText(link);
    alert("Đã copy link! Gửi link này cho khách qua Zalo nhé.");
  }

  async function xacNhanKemGioDen(idDon: number) {
    if (!ngayDenDuKien || !gioDenDuKien) {
      alert("Vui lòng chọn đủ ngày và giờ dự kiến đến.");
      return;
    }

    const gioDuKienDen = `${ngayDenDuKien}T${gioDenDuKien}:00`;

    const { error } = await supabase
      .from("don_dat_lich")
      .update({ trang_thai: "Đã xác nhận", gio_du_kien_den: gioDuKienDen })
      .eq("id", idDon);

    if (error) {
      alert("Lỗi: " + error.message);
    } else {
      setDanhSachDon((truoc) =>
        truoc.map((d) =>
          d.id === idDon ? { ...d, trang_thai: "Đã xác nhận", gio_du_kien_den: gioDuKienDen } : d
        )
      );
      setDonDangXacNhan(null);
    }
  }

  const layMauTrangThai = (trangThai: string) => {
    switch (trangThai) {
      case "Chờ xác nhận":
        return "bg-gold-soft text-gold border-gold/30 focus:ring-gold";
      case "Đã xác nhận":
        return "bg-teal-soft text-teal border-teal/30 focus:ring-teal";
      case "Đã hoàn thành":
        return "bg-teal text-white border-teal focus:ring-teal";
      case "Đã hủy":
        return "bg-rust-soft text-rust border-rust/30 focus:ring-rust";
      default:
        return "bg-line text-ink-soft border-line focus:ring-ink-soft";
    }
  };

  const danhSachHienThi = danhSachDon.filter((don) => {
    if (boLoc === "Tất cả") return true;
    return don.trang_thai === boLoc;
  });

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
        <h1 className="text-3xl font-extrabold text-ink mb-6">
          📦 Đơn đặt lịch của tôi
        </h1>

        <div className="flex flex-wrap gap-2 mb-8 bg-card p-2 rounded-2xl shadow-sm border border-line">
          {["Tất cả", "Chờ xác nhận", "Đã xác nhận", "Đã hoàn thành", "Đã hủy"].map((trangThaiTab) => {
            const soLuong = trangThaiTab === "Tất cả"
              ? danhSachDon.length
              : danhSachDon.filter(d => d.trang_thai === trangThaiTab).length;

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
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  boLoc === trangThaiTab ? "bg-white/25 text-white" : "bg-line text-ink-soft"
                }`}>
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
            {danhSachHienThi.map((don) => (
              <div
                key={don.id}
                className="bg-card border border-line rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden"
              >
                <div className="bg-paper px-5 py-4 border-b border-line flex justify-between items-center">
                  <div>
                    <p className="text-sm text-ink-soft font-medium mb-1">Khách hàng</p>
                    <h3 className="text-lg font-bold text-ink line-clamp-1">
                      {don.ten_khach}
                    </h3>
                  </div>
                  <a
                    href={`tel:${don.so_dien_thoai}`}
                    className="bg-teal-soft text-teal p-2.5 rounded-full hover:opacity-80 transition-colors shrink-0"
                    title="Gọi ngay"
                  >
                    📞
                  </a>
                </div>

                <div className="p-5 flex-1 flex flex-col gap-3 text-sm text-ink-soft">
                  <div className="flex items-start gap-2.5">
                    <span className="text-ink-soft mt-0.5">📞</span>
                    <span className="font-medium text-ink">{don.so_dien_thoai}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-ink-soft mt-0.5">🕒</span>
                    <span>Khách hẹn: {new Date(don.gio_hen).toLocaleString("vi-VN")}</span>
                  </div>

                  {don.gio_du_kien_den && (
                    <div className="flex items-start gap-2.5 bg-teal-soft p-2.5 rounded-lg border border-teal/20">
                      <span className="text-teal mt-0.5">🚗</span>
                      <span className="text-teal font-medium">
                        Bạn dự kiến đến: {new Date(don.gio_du_kien_den).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  )}

                  <div className="flex items-start gap-2.5">
                    <span className="text-ink-soft mt-0.5">📍</span>
                    <span className="line-clamp-2">{don.dia_chi_hen}</span>
                  </div>
                  {don.ghi_chu && (
                    <div className="flex items-start gap-2.5 bg-gold-soft p-3 rounded-lg border border-gold/20 mt-2">
                      <span className="text-gold mt-0.5">📝</span>
                      <span className="text-ink-soft italic line-clamp-3">
                        {don.ghi_chu}
                      </span>
                    </div>
                  )}

                  {don.tho_xac_nhan_hoan_thanh && don.trang_thai !== "Đã hoàn thành" && (
                    <div className="flex items-start gap-2.5 bg-teal-soft p-2.5 rounded-lg border border-teal/20">
                      <span className="text-teal mt-0.5">⏳</span>
                      <span className="text-teal font-medium">
                        Bạn đã xác nhận hoàn thành – đang chờ khách xác nhận
                      </span>
                    </div>
                  )}
                </div>

                {donDangXacNhan === don.id ? (
                  <div className="p-5 pt-0 mt-auto flex flex-col gap-2 bg-teal-soft border-t border-teal/20">
                    <p className="text-xs font-semibold text-teal mt-3">Dự kiến bạn đến lúc nào?</p>
                    <input
                      type="date"
                      value={ngayDenDuKien}
                      onChange={(e) => setNgayDenDuKien(e.target.value)}
                      className="border border-line rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-teal"
                    />
                    <input
                      type="time"
                      value={gioDenDuKien}
                      onChange={(e) => setGioDenDuKien(e.target.value)}
                      className="border border-line rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-teal"
                    />
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => xacNhanKemGioDen(don.id)}
                        className="flex-1 bg-teal hover:opacity-90 text-white py-2 rounded-lg text-sm font-semibold transition"
                      >
                        Xác nhận
                      </button>
                      <button
                        onClick={() => setDonDangXacNhan(null)}
                        className="bg-line hover:bg-ink-soft hover:text-white text-ink-soft px-3 py-2 rounded-lg text-sm transition"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 pt-0 mt-auto flex flex-col gap-2">
                    <div className="relative">
                      <select
                        value={don.trang_thai}
                        onChange={(e) => doiTrangThai(don.id, e.target.value)}
                        className={`appearance-none w-full border font-semibold px-4 py-2.5 rounded-xl cursor-pointer outline-none transition-all focus:ring-2 pr-10 ${layMauTrangThai(
                          don.trang_thai
                        )}`}
                      >
                        <option value="Chờ xác nhận">⏳ Chờ xác nhận</option>
                        <option value="Đã xác nhận">👍 Đã xác nhận</option>
                        <option value="Đã hoàn thành">✅ Đã hoàn thành</option>
                        <option value="Đã hủy">❌ Đã hủy</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-ink-soft">
                        <svg className="w-4 h-4 fill-current opacity-70" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>

                    {(don.trang_thai === "Đã xác nhận" || don.tho_xac_nhan_hoan_thanh) &&
                      don.trang_thai !== "Đã hủy" && (
                        <button
                          onClick={() => copyLinkChoKhach(don.id)}
                          className="w-full text-xs font-semibold text-rust border border-rust/30 bg-rust-soft hover:opacity-80 py-2 rounded-lg transition"
                        >
                          🔗 Copy link đơn cho khách
                        </button>
                      )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}