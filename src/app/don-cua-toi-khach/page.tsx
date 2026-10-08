"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { layHoSoKhachHienTai } from "../../lib/khach";
import KhoiLichHen, { dinhDangGioNgan } from "../../components/KhoiLichHen";
import Link from "next/link";
import { ArrowLeft, ClipboardList, Car, ArrowRight, XCircle } from "lucide-react";
import NhanTrangThai from "../../components/NhanTrangThai";
import { useThongBao, useXacNhan } from "../../components/ThongBao";
import { dichLoiSupabase } from "../../lib/dichLoi";
import NhacDonBoQuen, { type MucNhac } from "../../components/NhacDonBoQuen";
import { layNhacDon } from "../../lib/gioHen";

export default function DonCuaToiKhach() {
  const [danhSachDon, setDanhSachDon] = useState<any[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [boLoc, setBoLoc] = useState("Tất cả");
  const router = useRouter();
  const thongBao = useThongBao();
  const xacNhanHopThoai = useXacNhan();
  // Đơn đang được làm nổi bật sau khi bấm "Xem đơn" ở khung nhắc
  const [donNoiBat, setDonNoiBat] = useState<number | null>(null);

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

  async function huyDon(don: any) {
    const daXacNhan = don.trang_thai === "Đã xác nhận";
    const dongY = await xacNhanHopThoai(
      daXacNhan
        ? "Hủy đơn đã được thợ xác nhận? Thợ đã sắp xếp lịch theo đơn này — nên báo thợ trước nếu có thể. Không thể hoàn tác."
        : "Hủy đơn này? Bạn sẽ cần đặt lịch lại nếu vẫn cần thợ."
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
      thongBao("Đã hủy đơn.", "thanhcong");
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

  const danhSachHienThi = danhSachDon.filter((don) => {
    if (boLoc === "Tất cả") return true;
    return don.trang_thai === boLoc;
  });

  const mucNhac: MucNhac[] = [];
  for (const don of danhSachDon) {
    const noiDung = layNhacDon(don, "khach");
    if (noiDung) {
      mucNhac.push({
        id: don.id,
        tieuDe: `Thợ ${don.tho?.ten ?? "đang cập nhật"} · ${dinhDangGioNgan(don.gio_hen)}`,
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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/tho-gan-ban" className="text-sm text-rust hover:underline font-medium flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-6 flex items-center gap-2">
          <ClipboardList className="w-6 h-6" /> Đơn của tôi
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
              return (
                <div
                  key={don.id}
                  id={`don-${don.id}`}
                  className={`bg-card border border-line rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden ${
                    donNoiBat === don.id ? "ring-2 ring-gold" : ""
                  }`}
                >
                  <Link href={`/don/${don.id}`} className="flex flex-col flex-1">
                    <div className="bg-paper px-5 py-4 border-b border-line">
                      <p className="text-sm text-ink-soft font-medium mb-1">Thợ</p>
                      <h3 className="text-lg font-bold text-ink line-clamp-1">
                        {don.tho?.ten ?? "Đang cập nhật"}
                      </h3>
                    </div>

                    <div className="p-5 flex-1 flex flex-col gap-3 text-sm text-ink-soft">
                      <NhanTrangThai trangThai={don.trang_thai} className="self-start" />

                      <KhoiLichHen gioHen={don.gio_hen} diaChi={don.dia_chi_hen} gioiHanDong />

                      {don.trang_thai === "Đã xác nhận" &&
                        Boolean(don.tho_xac_nhan_hoan_thanh) !== Boolean(don.khach_xac_nhan_hoan_thanh) && (
                        <p className="text-xs font-semibold text-teal bg-teal-soft border border-teal/20 rounded-lg px-3 py-2">
                          {don.khach_xac_nhan_hoan_thanh
                            ? "Bạn đã xác nhận hoàn thành — đang chờ thợ."
                            : "Thợ đã xác nhận hoàn thành — đang chờ bạn xác nhận."}
                        </p>
                      )}

                      {don.gio_du_kien_den && (
                        <div className="flex items-start gap-2.5 bg-teal-soft p-2.5 rounded-lg border border-teal/20">
                          <Car className="w-4 h-4 text-teal mt-0.5 shrink-0" />
                          <span className="text-teal font-semibold">
                            Thợ dự kiến đến: {dinhDangGioNgan(don.gio_du_kien_den)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="px-5 pb-5">
                      <span className="inline-flex items-center justify-center gap-1.5 w-full text-sm font-semibold text-white bg-rust hover:opacity-90 transition px-4 py-2.5 rounded-xl shadow-sm">
                        Xem chi tiết <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>

                  {(don.trang_thai === "Chờ xác nhận" || don.trang_thai === "Đã xác nhận") && (
                    <div className="px-5 pb-5 -mt-2">
                      <button
                        onClick={() => huyDon(don)}
                        className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-ink-soft border border-line hover:bg-rust-soft hover:text-rust hover:border-rust/30 py-2 rounded-lg transition"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Hủy đơn
                      </button>
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