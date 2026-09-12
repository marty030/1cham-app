"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { layHoSoKhachHienTai } from "../../lib/khach";
import { TUY_CHON_GIO_VN } from "../../lib/thoiGianVN";
import Link from "next/link";
import { ArrowLeft, ClipboardList, Clock, Car, MapPin, ArrowRight } from "lucide-react";

const NHAN_TRANG_THAI: Record<string, { text: string; mau: string }> = {
  "Chờ xác nhận": { text: "⏳ Chờ thợ xác nhận", mau: "bg-gold-soft text-gold border-gold/20" },
  "Đã xác nhận": { text: "👍 Thợ đã xác nhận", mau: "bg-teal-soft text-teal border-teal/20" },
  "Đã hoàn thành": { text: "✅ Đã hoàn thành", mau: "bg-teal text-white border-teal" },
  "Đã hủy": { text: "❌ Đã hủy", mau: "bg-rust-soft text-rust border-rust/20" },
};

export default function DonCuaToiKhach() {
  const [danhSachDon, setDanhSachDon] = useState<any[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [boLoc, setBoLoc] = useState("Tất cả");
  const router = useRouter();

  useEffect(() => {
    async function layDon() {
      const hoSo = await layHoSoKhachHienTai();
      if (!hoSo) {
        router.push("/login?next=/don-cua-toi-khach");
        return;
      }

      const { data, error } = await supabase
        .from("don_dat_lich")
        .select("*, tho(ten)")
        .eq("khach_id", hoSo.id)
        .order("id", { ascending: false });

      if (error) {
        console.error("Lỗi tải đơn của khách:", error);
      } else {
        setDanhSachDon(data || []);
      }
      setDangTai(false);
    }
    layDon();
  }, [router]);

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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/tho-gan-ban" className="text-sm text-rust hover:underline font-medium flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </Link>
        </div>

        <h1 className="text-3xl font-extrabold text-ink mb-6 flex items-center gap-2">
          <ClipboardList className="w-7 h-7" /> Đơn của tôi
        </h1>

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
            <p className="text-ink-soft text-lg">Chưa có đơn nào ở trạng thái này.</p>
            <Link
              href="/tho-gan-ban"
              className="inline-block mt-4 text-rust font-semibold hover:underline"
            >
              Tìm thợ và đặt lịch ngay →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {danhSachHienThi.map((don) => {
              const nhan = NHAN_TRANG_THAI[don.trang_thai] ?? {
                text: don.trang_thai,
                mau: "bg-line text-ink-soft border-line",
              };

              return (
                <Link
                  key={don.id}
                  href={`/don/${don.id}`}
                  className="bg-card border border-line rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden"
                >
                  <div className="bg-paper px-5 py-4 border-b border-line">
                    <p className="text-sm text-ink-soft font-medium mb-1">Thợ</p>
                    <h3 className="text-lg font-bold text-ink line-clamp-1">
                      {don.tho?.ten ?? "Đang cập nhật"}
                    </h3>
                  </div>

                  <div className="p-5 flex-1 flex flex-col gap-3 text-sm text-ink-soft">
                    <span className={`self-start text-xs font-semibold px-3 py-1.5 rounded-full border ${nhan.mau}`}>
                      {nhan.text}
                    </span>

                    <div className="flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-ink-soft mt-0.5 shrink-0" />
                      <span>{new Date(don.gio_hen).toLocaleString("vi-VN", TUY_CHON_GIO_VN)}</span>
                    </div>

                    {don.gio_du_kien_den && (
                      <div className="flex items-start gap-2.5 bg-teal-soft p-2.5 rounded-lg border border-teal/20">
                        <Car className="w-4 h-4 text-teal mt-0.5 shrink-0" />
                        <span className="text-teal font-medium">
                          Thợ dự kiến đến: {new Date(don.gio_du_kien_den).toLocaleString("vi-VN", TUY_CHON_GIO_VN)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-ink-soft mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{don.dia_chi_hen}</span>
                    </div>
                  </div>

                  <div className="px-5 pb-5">
  <span className="inline-flex items-center gap-1 text-xs font-semibold text-rust">
    Xem chi tiết / xác nhận <ArrowRight className="w-3.5 h-3.5" />
  </span>
</div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}