"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function DonCuaToi() {
  const [danhSachDon, setDanhSachDon] = useState<any[]>([]);
  const [dangTai, setDangTai] = useState(true);
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

  if (dangTai) return <p className="p-8">Đang tải...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6">Đơn đặt lịch của tôi</h1>
      <div className="flex flex-col gap-3">
        {danhSachDon.length === 0 && <p>Chưa có đơn đặt lịch nào.</p>}
        {danhSachDon.map((don) => (
          <div key={don.id} className="bg-white border border-gray-300 rounded-lg p-4">
            <p><strong>Khách:</strong> {don.ten_khach}</p>
            <p><strong>SĐT:</strong> {don.so_dien_thoai}</p>
            <p><strong>Giờ hẹn:</strong> {new Date(don.gio_hen).toLocaleString("vi-VN")}</p>
            <p><strong>Địa chỉ:</strong> {don.dia_chi_hen}</p>
            <p><strong>Ghi chú:</strong> {don.ghi_chu}</p>
            <p><strong>Trạng thái:</strong> {don.trang_thai}</p>

            <select
              value={don.trang_thai}
              onChange={(e) => doiTrangThai(don.id, e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1 mt-2"
            >
              <option value="Chờ xác nhận">Chờ xác nhận</option>
              <option value="Đã xác nhận">Đã xác nhận</option>
              <option value="Đã hoàn thành">Đã hoàn thành</option>
              <option value="Đã hủy">Đã hủy</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}