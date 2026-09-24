"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { layHoSoKhachHienTai } from "../../../lib/khach";
import { TUY_CHON_GIO_VN } from "../../../lib/thoiGianVN";
import { Clock, Car, MapPin, StickyNote, CheckCircle2, Star, Send, Hourglass } from "lucide-react";
import NhanTrangThai from "../../../components/NhanTrangThai";
import { useThongBao } from "../../../components/ThongBao";
import { dichLoiSupabase } from "../../../lib/dichLoi";

type DonDatLich = {
  id: number;
  trang_thai: string;
  gio_hen: string;
  gio_du_kien_den: string | null;
  dia_chi_hen: string;
  ghi_chu: string | null;
  tho_id: number;
  khach_id: number | null;
  tho_xac_nhan_hoan_thanh: boolean;
  khach_xac_nhan_hoan_thanh: boolean;
  tho: { ten: string } | null;
};

export default function TrangDonKhach() {
  const params = useParams();
  const donId = params.id as string;

  const [don, setDon] = useState<DonDatLich | null>(null);
  const [loading, setLoading] = useState(true);
  const [khongTimThay, setKhongTimThay] = useState(false);
  const [daGuiDanhGia, setDaGuiDanhGia] = useState(false);
  const [soSao, setSoSao] = useState(0);
  const [binhLuan, setBinhLuan] = useState("");
  const [dangGui, setDangGui] = useState(false);
  const [dangXacNhan, setDangXacNhan] = useState(false);
  const [laChuDon, setLaChuDon] = useState(false);
  const thongBao = useThongBao();

  useEffect(() => {
    layDon();
  }, [donId]);

  async function layDon() {
    setLoading(true);
    const { data, error } = await supabase
      .from("don_dat_lich")
      .select("*, tho(ten)")
      .eq("id", donId)
      .single();

    if (error || !data) {
      console.error("Không lấy được đơn:", error);
      setKhongTimThay(true);
    } else {
      const donData = data as unknown as DonDatLich;
      setDon(donData);

      const hoSo = await layHoSoKhachHienTai();
      setLaChuDon(!!hoSo && !!donData.khach_id && hoSo.id === donData.khach_id);
    }
    setLoading(false);
  }

  async function xacNhanHoanThanh() {
    if (!don) return;
    setDangXacNhan(true);

    const capNhat: any = { khach_xac_nhan_hoan_thanh: true };
    if (don.tho_xac_nhan_hoan_thanh) {
      capNhat.trang_thai = "Đã hoàn thành";
    }

    const { error } = await supabase
      .from("don_dat_lich")
      .update(capNhat)
      .eq("id", don.id);

    setDangXacNhan(false);

    if (!error) {
      setDon({ ...don, ...capNhat });
    } else {
      thongBao(error.message ? dichLoiSupabase(error.message) : "Có lỗi khi xác nhận, thử lại nhé.", "loi");
    }
  }

  async function guiDanhGia() {
    if (!don || soSao === 0) return;
    setDangGui(true);

    const { error } = await supabase.from("danh_gia").insert({
      don_dat_lich_id: don.id,
      tho_id: don.tho_id,
      so_sao: soSao,
      binh_luan: binhLuan.trim() || null,
    });

    setDangGui(false);
    if (!error) {
      setDaGuiDanhGia(true);
    } else {
      thongBao(error.message ? dichLoiSupabase(error.message) : "Có lỗi khi gửi đánh giá, thử lại nhé.", "loi");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rust"></div>
      </div>
    );
  }

  if (khongTimThay || !don) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper p-6">
        <p className="text-ink-soft">Không tìm thấy đơn này. Kiểm tra lại link nhé.</p>
      </div>
    );
  }

  const coTheXacNhanHoanThanh =
    don.trang_thai === "Đã xác nhận" && !don.khach_xac_nhan_hoan_thanh && laChuDon;

  return (
    <div className="min-h-screen bg-paper py-10 px-4">
      <div className="max-w-md mx-auto bg-card rounded-2xl shadow-sm border border-line overflow-hidden">
        <div className="bg-paper px-6 py-4 border-b border-line">
          <p className="text-sm text-ink-soft font-medium">Đơn #{don.id}</p>
          <h1 className="text-xl font-bold text-ink">
            Thợ: {don.tho?.ten ?? "Đang cập nhật"}
          </h1>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <NhanTrangThai trangThai={don.trang_thai} className="self-start text-sm px-3 py-1.5" />

          <div className="flex flex-col gap-2 text-sm text-ink-soft">
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-ink-soft mt-0.5 shrink-0" />
              <span>Giờ hẹn: {new Date(don.gio_hen).toLocaleString("vi-VN", TUY_CHON_GIO_VN)}</span>
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
              <span>{don.dia_chi_hen}</span>
            </div>

            {don.ghi_chu && (
              <div className="flex items-start gap-2.5 bg-gold-soft p-3 rounded-lg border border-gold/20">
                <StickyNote className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <span className="text-ink-soft italic">{don.ghi_chu}</span>
              </div>
            )}
          </div>

          {don.trang_thai === "Chờ xác nhận" && (
            <p className="text-sm text-ink-soft border-t border-line pt-4">
              Đơn đang chờ thợ xác nhận. Quay lại link này sau khi thợ nhận đơn để xác nhận hoàn thành và đánh giá nhé.
            </p>
          )}

          {don.trang_thai === "Đã hủy" && (
            <p className="text-sm text-rust border-t border-line pt-4">Đơn này đã bị hủy.</p>
          )}

          {don.trang_thai === "Đã xác nhận" && !laChuDon && !don.khach_xac_nhan_hoan_thanh && (
            <p className="text-sm text-ink-soft bg-paper border border-line rounded-lg p-3">
              Chỉ khách hàng đã đặt đơn này mới xác nhận hoàn thành và đánh giá được — đăng nhập
              đúng tài khoản đã dùng để đặt lịch nếu đây là đơn của bạn.
            </p>
          )}

          {coTheXacNhanHoanThanh && (
            <button
              onClick={xacNhanHoanThanh}
              disabled={dangXacNhan}
              className="w-full bg-teal hover:opacity-90 text-white py-3 rounded-lg font-medium disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{dangXacNhan ? "Đang xác nhận..." : "Xác nhận hoàn thành đơn (đã thanh toán)"}</span>
            </button>
          )}

          {don.trang_thai === "Đã xác nhận" && don.khach_xac_nhan_hoan_thanh && !don.tho_xac_nhan_hoan_thanh && (
            <p className="text-sm text-teal bg-teal-soft border border-teal/20 rounded-lg p-3 flex items-center gap-2">
              <Hourglass className="w-4 h-4 shrink-0" /> Bạn đã xác nhận hoàn thành — đang chờ thợ xác nhận để hoàn tất đơn.
            </p>
          )}

          {laChuDon && don.khach_xac_nhan_hoan_thanh && !daGuiDanhGia && (
            <div className="space-y-3 border-t border-line pt-4">
              <p className="font-medium text-ink">Bạn chấm mấy sao cho thợ?</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((sao) => (
                  <button
                    key={sao}
                    onClick={() => setSoSao(sao)}
                    className={`transition-colors ${sao <= soSao ? "text-gold" : "text-line"}`}
                  >
                    <Star className="w-8 h-8" fill={sao <= soSao ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
              <textarea
                value={binhLuan}
                onChange={(e) => setBinhLuan(e.target.value)}
                placeholder="Nhận xét (không bắt buộc)"
                className="w-full border border-line rounded-lg p-2 outline-none focus:border-teal"
                rows={2}
              />
              <button
                onClick={guiDanhGia}
                disabled={soSao === 0 || dangGui}
                className="w-full bg-teal hover:opacity-90 text-white py-3 rounded-lg font-medium disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{dangGui ? "Đang gửi..." : "Gửi đánh giá"}</span>
              </button>
            </div>
          )}

          {daGuiDanhGia && (
            <p className="text-teal font-medium border-t border-line pt-4">Cảm ơn bạn đã đánh giá!</p>
          )}
        </div>
      </div>
    </div>
  );
}