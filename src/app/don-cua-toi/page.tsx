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
    // Lấy dữ liệu mới nhất từ Supabase — khách có thể đã xác nhận qua link riêng,
    // nên không thể tin vào state cũ trong danhSachDon (chỉ tải 1 lần lúc vào trang).
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
        return "bg-yellow-100 text-yellow-800 border-yellow-300 focus:ring-yellow-500";
      case "Đã xác nhận":
        return "bg-blue-100 text-blue-800 border-blue-300 focus:ring-blue-500";
      case "Đã hoàn thành":
        return "bg-green-100 text-green-800 border-green-300 focus:ring-green-500";
      case "Đã hủy":
        return "bg-red-100 text-red-800 border-red-300 focus:ring-red-500";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300 focus:ring-gray-500";
    }
  };

  const danhSachHienThi = danhSachDon.filter((don) => {
    if (boLoc === "Tất cả") return true;
    return don.trang_thai === boLoc;
  });

  if (dangTai) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6">
          📦 Đơn đặt lịch của tôi
        </h1>

        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
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
                    ? "bg-orange-500 text-white shadow-sm"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span>{trangThaiTab}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  boLoc === trangThaiTab ? "bg-orange-600 text-white" : "bg-gray-200 text-gray-700"
                }`}>
                  {soLuong}
                </span>
              </button>
            );
          })}
        </div>

        {danhSachHienThi.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-gray-100">
            <p className="text-gray-400 text-lg">Không có đơn hàng nào ở trạng thái này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {danhSachHienThi.map((don) => (
              <div
                key={don.id}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden"
              >
                <div className="bg-gray-50 px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">Khách hàng</p>
                    <h3 className="text-lg font-bold text-gray-800 line-clamp-1">
                      {don.ten_khach}
                    </h3>
                  </div>
                  <a
                    href={`tel:${don.so_dien_thoai}`}
                    className="bg-green-100 text-green-600 p-2.5 rounded-full hover:bg-green-200 transition-colors shrink-0"
                    title="Gọi ngay"
                  >
                    📞
                  </a>
                </div>

                <div className="p-5 flex-1 flex flex-col gap-3 text-sm text-gray-700">
                  <div className="flex items-start gap-2.5">
                    <span className="text-gray-400 mt-0.5">📞</span>
                    <span className="font-medium">{don.so_dien_thoai}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-gray-400 mt-0.5">🕒</span>
                    <span>Khách hẹn: {new Date(don.gio_hen).toLocaleString("vi-VN")}</span>
                  </div>

                  {don.gio_du_kien_den && (
                    <div className="flex items-start gap-2.5 bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                      <span className="text-blue-500 mt-0.5">🚗</span>
                      <span className="text-blue-700 font-medium">
                        Bạn dự kiến đến: {new Date(don.gio_du_kien_den).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  )}

                  <div className="flex items-start gap-2.5">
                    <span className="text-gray-400 mt-0.5">📍</span>
                    <span className="line-clamp-2">{don.dia_chi_hen}</span>
                  </div>
                  {don.ghi_chu && (
                    <div className="flex items-start gap-2.5 bg-yellow-50 p-3 rounded-lg border border-yellow-100 mt-2">
                      <span className="text-yellow-600 mt-0.5">📝</span>
                      <span className="text-yellow-800 italic line-clamp-3">
                        {don.ghi_chu}
                      </span>
                    </div>
                  )}

                  {don.tho_xac_nhan_hoan_thanh && don.trang_thai !== "Đã hoàn thành" && (
                    <div className="flex items-start gap-2.5 bg-purple-50 p-2.5 rounded-lg border border-purple-100">
                      <span className="text-purple-500 mt-0.5">⏳</span>
                      <span className="text-purple-700 font-medium">
                        Bạn đã xác nhận hoàn thành – đang chờ khách xác nhận
                      </span>
                    </div>
                  )}
                </div>

                {donDangXacNhan === don.id ? (
                  <div className="p-5 pt-0 mt-auto flex flex-col gap-2 bg-blue-50 border-t border-blue-100">
                    <p className="text-xs font-semibold text-blue-700 mt-3">Dự kiến bạn đến lúc nào?</p>
                    <input
                      type="date"
                      value={ngayDenDuKien}
                      onChange={(e) => setNgayDenDuKien(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
                    />
                    <input
                      type="time"
                      value={gioDenDuKien}
                      onChange={(e) => setGioDenDuKien(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
                    />
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => xacNhanKemGioDen(don.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold"
                      >
                        Xác nhận
                      </button>
                      <button
                        onClick={() => setDonDangXacNhan(null)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-2 rounded-lg text-sm"
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
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                        <svg className="w-4 h-4 fill-current opacity-70" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>

                    {(don.trang_thai === "Đã xác nhận" || don.tho_xac_nhan_hoan_thanh) &&
                      don.trang_thai !== "Đã hủy" && (
                        <button
                          onClick={() => copyLinkChoKhach(don.id)}
                          className="w-full text-xs font-semibold text-orange-600 border border-orange-200 bg-orange-50 hover:bg-orange-100 py-2 rounded-lg"
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