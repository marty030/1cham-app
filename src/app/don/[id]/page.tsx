"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type DonDatLich = {
  id: number;
  trang_thai: string;
  gio_hen: string;
  gio_du_kien_den: string | null;
  dia_chi_hen: string;
  ghi_chu: string | null;
  tho_id: number;
  tho_xac_nhan_hoan_thanh: boolean;
  khach_xac_nhan_hoan_thanh: boolean;
  tho: { ten: string } | null;
};

const NHAN_TRANG_THAI: Record<string, { text: string; mau: string }> = {
  "Chờ xác nhận": { text: "⏳ Chờ thợ xác nhận", mau: "bg-gold-soft text-gold border-gold/20" },
  "Đã xác nhận": { text: "👍 Thợ đã xác nhận", mau: "bg-teal-soft text-teal border-teal/20" },
  "Đã hoàn thành": { text: "✅ Đã hoàn thành", mau: "bg-teal text-white border-teal" },
  "Đã hủy": { text: "❌ Đã hủy", mau: "bg-rust-soft text-rust border-rust/20" },
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
      setDon(data as unknown as DonDatLich);
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
      alert("Có lỗi khi xác nhận, thử lại nhé.");
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
      alert("Có lỗi khi gửi đánh giá, thử lại nhé.");
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

  const nhan = NHAN_TRANG_THAI[don.trang_thai] ?? {
    text: don.trang_thai,
    mau: "bg-line text-ink-soft border-line",
  };

  const coTheXacNhanHoanThanh = don.trang_thai === "Đã xác nhận" && !don.khach_xac_nhan_hoan_thanh;

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
          <span className={`self-start text-sm font-semibold px-3 py-1.5 rounded-full border ${nhan.mau}`}>
            {nhan.text}
          </span>

          <div className="flex flex-col gap-2 text-sm text-ink-soft">
            <div className="flex items-start gap-2.5">
              <span className="text-ink-soft mt-0.5">🕒</span>
              <span>Giờ hẹn: {new Date(don.gio_hen).toLocaleString("vi-VN")}</span>
            </div>

            {don.gio_du_kien_den && (
              <div className="flex items-start gap-2.5 bg-teal-soft p-2.5 rounded-lg border border-teal/20">
                <span className="text-teal mt-0.5">🚗</span>
                <span className="text-teal font-medium">
                  Thợ dự kiến đến: {new Date(don.gio_du_kien_den).toLocaleString("vi-VN")}
                </span>
              </div>
            )}

            <div className="flex items-start gap-2.5">
              <span className="text-ink-soft mt-0.5">📍</span>
              <span>{don.dia_chi_hen}</span>
            </div>

            {don.ghi_chu && (
              <div className="flex items-start gap-2.5 bg-gold-soft p-3 rounded-lg border border-gold/20">
                <span className="text-gold mt-0.5">📝</span>
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

          {coTheXacNhanHoanThanh && (
            <button
              onClick={xacNhanHoanThanh}
              disabled={dangXacNhan}
              className="w-full bg-teal hover:opacity-90 text-white py-3 rounded-lg font-medium disabled:opacity-50 transition"
            >
              {dangXacNhan ? "Đang xác nhận..." : "Xác nhận hoàn thành đơn (đã thanh toán)"}
            </button>
          )}

          {don.trang_thai === "Đã xác nhận" && don.khach_xac_nhan_hoan_thanh && !don.tho_xac_nhan_hoan_thanh && (
            <p className="text-sm text-teal bg-teal-soft border border-teal/20 rounded-lg p-3">
              ⏳ Bạn đã xác nhận hoàn thành — đang chờ thợ xác nhận để hoàn tất đơn.
            </p>
          )}

          {don.khach_xac_nhan_hoan_thanh && !daGuiDanhGia && (
            <div className="space-y-3 border-t border-line pt-4">
              <p className="font-medium text-ink">Bạn chấm mấy sao cho thợ?</p>
              <div className="flex gap-2 text-3xl">
                {[1, 2, 3, 4, 5].map((sao) => (
                  <button
                    key={sao}
                    onClick={() => setSoSao(sao)}
                    className={sao <= soSao ? "text-gold" : "text-line"}
                  >
                    ★
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
                className="w-full bg-teal hover:opacity-90 text-white py-3 rounded-lg font-medium disabled:opacity-50 transition"
              >
                {dangGui ? "Đang gửi..." : "Gửi đánh giá"}
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