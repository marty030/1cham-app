"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function DonCuaToi() {
  const [danhSachDon, setDanhSachDon] = useState<any[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [boLoc, setBoLoc] = useState("Tất cả"); // State quản lý trạng thái lọc
  const router = useRouter();

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

  // Hàm phụ trợ để lấy màu sắc theo trạng thái
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

  // Lọc danh sách đơn dựa theo tab đang chọn
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

        {/* --- THANH CÔNG CỤ LỌC (FILTER TABS) --- */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          {["Tất cả", "Chờ xác nhận", "Đã xác nhận", "Đã hoàn thành", "Đã hủy"].map((trangThaiTab) => {
            // Đếm số lượng đơn cho từng trạng thái để hiển thị badge con số cho xịn
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

        {/* --- DANH SÁCH ĐƠN HÀNG --- */}
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
                {/* Header Card */}
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

                {/* Body Card */}
                <div className="p-5 flex-1 flex flex-col gap-3 text-sm text-gray-700">
                  <div className="flex items-start gap-2.5">
                    <span className="text-gray-400 mt-0.5">📞</span>
                    <span className="font-medium">{don.so_dien_thoai}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-gray-400 mt-0.5">🕒</span>
                    <span>{new Date(don.gio_hen).toLocaleString("vi-VN")}</span>
                  </div>
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
                </div>

                {/* Footer Card - Dropdown Trạng thái */}
                <div className="p-5 pt-0 mt-auto">
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}