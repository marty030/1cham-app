"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import { TUY_CHON_GIO_VN } from "../../../lib/thoiGianVN";
import { ClipboardList } from "lucide-react";
import NhanTrangThai from "../../../components/NhanTrangThai";

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

  if (!daDangNhap) return <p className="p-8 text-ink-soft">Đang kiểm tra đăng nhập...</p>;

  return (
    <div className="min-h-screen bg-paper p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-6 flex items-center gap-2">
          <ClipboardList className="w-6 h-6" /> Danh sách đơn đặt lịch (Admin)
        </h1>
        <div className="flex flex-col gap-3">
          {danhSachDon.map((don) => (
            <div key={don.id} className="bg-card border border-line rounded-2xl p-5 shadow-sm flex flex-col gap-1.5 text-sm text-ink-soft">
              <p><span className="font-semibold text-ink">Khách:</span> {don.ten_khach}</p>
              <p><span className="font-semibold text-ink">SĐT:</span> {don.so_dien_thoai}</p>
              <p><span className="font-semibold text-ink">Thợ:</span> {don.tho?.ten}</p>
              <p><span className="font-semibold text-ink">Giờ hẹn:</span> {new Date(don.gio_hen).toLocaleString("vi-VN", TUY_CHON_GIO_VN)}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-semibold text-ink">Trạng thái:</span>
                <NhanTrangThai trangThai={don.trang_thai} />
              </div>

              <select
                value={don.trang_thai}
                onChange={(e) => doiTrangThai(don.id, e.target.value)}
                className="border border-line rounded-lg px-3 py-2 mt-2 text-ink bg-card outline-none focus:border-teal"
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
    </div>
  );
}