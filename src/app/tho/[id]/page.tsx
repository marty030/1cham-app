"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { DANH_MUC_NGHE } from "../../../lib/danhMuc";
import { TUY_CHON_GIO_VN } from "../../../lib/thoiGianVN";
import { layHoSoKhachHienTai, HoSoKhach } from "../../../lib/khach";
import FormDatLich from "../../../components/FormDatLich";
import { ArrowLeft, MessageCircle, CalendarDays, Star, MapPin } from "lucide-react";
import { useDatLich } from "../../../hooks/useDatLich";

type DanhGia = {
  so_sao: number;
  binh_luan: string | null;
  created_at: string;
};

const CAC_CAP_DO = [
  { nguong: 0, ten: "Thợ mới" },
  { nguong: 5, ten: "Thợ cứng tay" },
  { nguong: 15, ten: "Thợ lành nghề" },
  { nguong: 30, ten: "Thợ chuyên nghiệp" },
  { nguong: 60, ten: "Chuyên gia" },
  { nguong: 100, ten: "Bậc thầy" },
];

function tinhCapDo(soDon: number) {
  let hienTai = CAC_CAP_DO[0];
  let ke = CAC_CAP_DO[1] ?? null;
  for (let i = 0; i < CAC_CAP_DO.length; i++) {
    if (soDon >= CAC_CAP_DO[i].nguong) {
      hienTai = CAC_CAP_DO[i];
      ke = CAC_CAP_DO[i + 1] ?? null;
    }
  }
  const phanTram = ke
    ? Math.min(100, Math.round(((soDon - hienTai.nguong) / (ke.nguong - hienTai.nguong)) * 100))
    : 100;
  return { hienTai, ke, phanTram };
}

export default function TrangChiTietTho() {
  const params = useParams();
  const router = useRouter();
  const thoId = params.id as string;

  const [tho, setTho] = useState<any>(null);
  const [dangTai, setDangTai] = useState(true);
  const [danhSachDanhGia, setDanhSachDanhGia] = useState<DanhGia[]>([]);
  const [dangBan, setDangBan] = useState(false);

  const [dangDatLich, setDangDatLich] = useState(false);
  const [hoSoKhach, setHoSoKhach] = useState<HoSoKhach | null>(null);

  // Nếu thợ chỉ làm đúng 1 ngành thì gán ngành đó cho đơn; thợ đa ngành thì để trống (chưa biết khách cần ngành nào)
  const danhMucDon = tho && (tho.danh_muc || []).length === 1 ? tho.danh_muc[0] : null;
  const datLich = useDatLich({ hoSoKhach, duongDanQuayLai: `/tho/${thoId}`, danhMuc: danhMucDon });

  useEffect(() => {
    layHoSoKhachHienTai().then(setHoSoKhach);
  }, []);

  useEffect(() => {
    async function taiDuLieu() {
      setDangTai(true);

      const { data: thoData, error } = await supabase
        .from("tho")
        .select("*")
        .eq("id", thoId)
        .single();

      if (error || !thoData) {
        console.error("Không lấy được thợ:", error);
        setDangTai(false);
        return;
      }
      setTho(thoData);

      const { data: donData } = await supabase
        .from("don_dat_lich")
        .select("gio_hen, trang_thai")
        .eq("tho_id", thoId)
        .eq("trang_thai", "Đã xác nhận");

      const banHienTai = (donData || []).some((don: any) => {
        const gio = new Date(don.gio_hen);
        const bayGio = new Date();
        const chenhLech = Math.abs(gio.getTime() - bayGio.getTime()) / (1000 * 60 * 60);
        return chenhLech < 2;
      });
      setDangBan(banHienTai);

      const { data: danhGiaData } = await supabase
        .from("danh_gia")
        .select("so_sao, binh_luan, created_at")
        .eq("tho_id", thoId)
        .order("created_at", { ascending: false })
        .limit(20);
      setDanhSachDanhGia(danhGiaData || []);

      setDangTai(false);
    }

    if (thoId) taiDuLieu();
  }, [thoId]);

  if (dangTai) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rust"></div>
      </div>
    );
  }

  if (!tho) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper p-6">
        <p className="text-ink-soft">Không tìm thấy thợ này.</p>
      </div>
    );
  }

  const chuCaiDau = tho.ten ? tho.ten.charAt(0).toUpperCase() : "T";

  function moDatLich() {
    if (datLich.batDau()) setDangDatLich(true);
  }
  const tenCacDanhMuc: string[] = (tho.danh_muc || []).map(
    (ma: string) => DANH_MUC_NGHE.find((m) => m.gia_tri === ma)?.nhan ?? ma
  );
  const soDon = tho.so_don_hoan_thanh || 0;
  const saoTrungBinh = tho.danh_gia_sao || 0;
  const { hienTai: capDoHienTai, ke: capDoKe, phanTram } = tinhCapDo(soDon);

  const huyHieu: { ten: string; icon: string }[] = [];
  if (soDon >= 1) huyHieu.push({ ten: "Đơn đầu tiên", icon: "🎉" });
  if (soDon >= 10) huyHieu.push({ ten: "10 đơn hoàn thành", icon: "🥉" });
  if (soDon >= 50) huyHieu.push({ ten: "50 đơn hoàn thành", icon: "🥈" });
  if (soDon >= 100) huyHieu.push({ ten: "100 đơn hoàn thành", icon: "🥇" });
  if (soDon >= 5 && saoTrungBinh >= 4.5) huyHieu.push({ ten: "Được yêu thích", icon: "❤️" });
  if (tenCacDanhMuc.length >= 2) huyHieu.push({ ten: "Đa năng", icon: "🧰" });

  return (
    <div className="min-h-screen bg-paper pb-28">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 flex flex-col gap-5">
        <button
          onClick={() => router.push("/tho-gan-ban")}
          className="self-start text-sm text-rust hover:underline font-medium flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Danh sách thợ
        </button>

        {/* HEADER */}
        <div className="bg-card border border-line rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-teal-soft text-teal flex items-center justify-center text-2xl font-bold shrink-0">
              {tho.anh_dai_dien ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tho.anh_dai_dien} alt={tho.ten} className="w-full h-full object-cover" />
              ) : (
                chuCaiDau
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl font-bold text-ink">{tho.ten}</h1>
              {tho.dang_nghi ? (
                <span className="bg-rust-soft text-rust border border-rust/20 text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-rust"></span> Đang nghỉ
                </span>
              ) : dangBan ? (
                <span className="bg-gold-soft text-gold border border-gold/20 text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold"></span> Đang bận
                </span>
              ) : (
                <span className="bg-teal-soft text-teal border border-teal/20 text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse"></span> Sẵn sàng
                </span>
              )}
            </div>
          </div>

          {tenCacDanhMuc.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tenCacDanhMuc.map((ten) => (
                <span key={ten} className="bg-paper border border-line text-ink-soft text-xs font-medium px-3 py-1 rounded-full">
                  {ten}
                </span>
              ))}
            </div>
          )}

          {tho.nghe && <p className="text-ink-soft text-sm">{tho.nghe}</p>}

          <div className="flex items-start gap-2.5 text-sm text-ink-soft">
            <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{tho.dia_chi}</span>
          </div>
        </div>

        {/* GAUGE CẤP ĐỘ */}
        <div className="bg-card border border-line rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-ink-soft uppercase tracking-wide font-mono">Cấp độ</p>
              <p className="text-lg font-bold text-gold">{capDoHienTai.ten}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-ink-soft uppercase tracking-wide font-mono">Điểm đánh giá</p>
              <p className="text-lg font-bold text-gold font-mono">
                {soDon > 0 ? (
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-gold text-gold" /> {saoTrungBinh}
                  </span>
                ) : (
                  "Chưa có"
                )}
              </p>
            </div>
          </div>

          <div>
            <div className="h-2.5 bg-line rounded-full overflow-hidden">
              <div
                className="h-full bg-gold rounded-full transition-all"
                style={{ width: `${phanTram}%` }}
              />
            </div>
            <p className="text-xs text-ink-soft mt-1.5 font-mono">
              {capDoKe
                ? `${soDon}/${capDoKe.nguong} đơn để lên "${capDoKe.ten}"`
                : `${soDon} đơn hoàn thành — cấp độ cao nhất`}
            </p>
          </div>

          {huyHieu.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-line">
              {huyHieu.map((hh) => (
                <span
                  key={hh.ten}
                  className="bg-gold-soft text-gold text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5"
                >
                  <span>{hh.icon}</span> {hh.ten}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ĐÁNH GIÁ TỪ KHÁCH */}
        <div className="bg-card border border-line rounded-2xl p-6 flex flex-col gap-3">
          <h2 className="text-base font-bold text-ink">Đánh giá từ khách hàng</h2>
          {danhSachDanhGia.length === 0 ? (
            <p className="text-ink-soft text-sm italic">Chưa có đánh giá nào.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {danhSachDanhGia.map((dg, i) => (
                <div key={i} className="border-b border-line last:border-0 pb-3 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="text-gold font-mono text-sm">
                      {"★".repeat(dg.so_sao)}
                      <span className="text-line">{"★".repeat(5 - dg.so_sao)}</span>
                    </span>
                    <span className="text-xs text-ink-soft font-mono">
                      {new Date(dg.created_at).toLocaleDateString("vi-VN", TUY_CHON_GIO_VN)}
                    </span>
                  </div>
                  {dg.binh_luan && <p className="text-sm text-ink-soft mt-1">{dg.binh_luan}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* THANH CTA DÍNH ĐÁY */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-line p-4 flex gap-3 max-w-2xl mx-auto sm:rounded-t-2xl sm:border sm:mb-4">
        <button
          onClick={() => router.push(`/chat/${tho.id}`)}
          className="flex-1 bg-card border border-teal text-teal hover:bg-teal-soft transition py-3 rounded-xl font-semibold flex items-center justify-center gap-1.5"
        >
          <MessageCircle className="w-4 h-4" /> Chat
        </button>
        <button
          onClick={moDatLich}
          className="flex-1 bg-rust hover:opacity-90 text-white transition py-3 rounded-xl font-semibold flex items-center justify-center gap-1.5"
        >
          <CalendarDays className="w-4 h-4" /> Đặt lịch
        </button>
      </div>

      <FormDatLich
        hienForm={dangDatLich}
        thoId={tho.id}
        tenKhach={datLich.tenKhach}
        soDienThoai={datLich.soDienThoai}
        gioHenDayDu={datLich.gioHenDayDu}
        diaChiHen={datLich.diaChiHen}
        ghiChu={datLich.ghiChu}
        onDoiTenKhach={datLich.setTenKhach}
        onDoiSoDienThoai={datLich.setSoDienThoai}
        onDoiGioHenDayDu={datLich.setGioHenDayDu}
        onDoiDiaChiHen={datLich.setDiaChiHen}
        onDoiGhiChu={datLich.setGhiChu}
        onHuy={() => {
          setDangDatLich(false);
          datLich.huy();
        }}
        onXacNhan={() => datLich.xacNhan(tho, () => setDangDatLich(false))}
        onGoiNgay={() => datLich.goiNgay(tho, () => setDangDatLich(false))}
      />
    </div>
  );
}