"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function DonDatLich() {
  const [danhSachDon, setDanhSachDon] = useState<any[]>([]);
  const [daDangNhap, setDaDangNhap] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function kiemTra() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/login");
      } else {
        setDaDangNhap(true);
      }
    }
    kiemTra();
  }, []);

  async function layDonDatLich() {
    const { data, error } = await supabase
      .from("don_dat_lich")
      .select("*, tho(ten)")
      .order("id", { ascending: false });
    if (error) {
      console.log("Lỗi:", error);
    } else {
      setDanhSachDon(data);
    }
  }

  useEffect(() => {
    if (!daDangNhap) return;
    layDonDatLich();
  }, [daDangNhap]);

  async function doiTrangThai(idDon: number, trangThaiMoi: string) {
    const { error } = await supabase
      .from("don_dat_lich")
      .update({ trang_thai: trangThaiMoi })
      .eq("id", idDon);
    if (error) {
      alert("Lỗi: " + error.message);
    } else {
      layDonDatLich();
    }
  }

  if (!daDangNhap) return <p className="p-8">Đang kiểm tra đăng nhập...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6">Danh sách đơn đặt lịch</h1>
      <div className="flex flex-col gap-3">
        {danhSachDon.map((don) => (
          <div key={don.id} className="bg-white border border-gray-300 rounded-lg p-4">
            <p><strong>Khách:</strong> {don.ten_khach}</p>
            <p><strong>SĐT:</strong> {don.so_dien_thoai}</p>
            <p><strong>Thợ:</strong> {don.tho?.ten}</p>
            <p><strong>Giờ hẹn:</strong> {new Date(don.gio_hen).toLocaleString("vi-VN")}</p>
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