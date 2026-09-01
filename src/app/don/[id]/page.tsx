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
  "Chờ xác nhận": { text: "⏳ Chờ thợ xác nhận", mau: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  "Đã xác nhận": { text: "👍 Thợ đã xác nhận", mau: "bg-blue-100 text-blue-800 border-blue-300" },
  "Đã hoàn thành": { text: "✅ Đã hoàn thành", mau: "bg-green-100 text-green-800 border-green-300" },
  "Đã hủy": { text: "❌ Đã hủy", mau: "bg-red-100 text-red-800 border-red-300" },
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (khongTimThay || !don) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <p className="text-gray-500">Không tìm thấy đơn này. Kiểm tra lại link nhé.</p>
      </div>
    );
  }

  const nhan = NHAN_TRANG_THAI[don.trang_thai] ?? {
    text: don.trang_thai,
    mau: "bg-gray-100 text-gray-800 border-gray-300",
  };

  const coTheXacNhanHoanThanh = don.trang_thai === "Đã xác nhận" && !don.khach_xac_nhan_hoan_thanh;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Đơn #{don.id}</p>
          <h1 className="text-xl font-bold text-gray-800">
            Thợ: {don.tho?.ten ?? "Đang cập nhật"}
          </h1>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <span className={`self-start text-sm font-semibold px-3 py-1.5 rounded-full border ${nhan.mau}`}>
            {nhan.text}
          </span>

          <div className="flex flex-col gap-2 text-sm text-gray-700">
            <div className="flex items-start gap-2.5">
              <span className="text-gray-400 mt-0.5">🕒</span>
              <span>Giờ hẹn: {new Date(don.gio_hen).toLocaleString("vi-VN")}</span>
            </div>

            {don.gio_du_kien_den && (
              <div className="flex items-start gap-2.5 bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                <span className="text-blue-500 mt-0.5">🚗</span>
                <span className="text-blue-700 font-medium">
                  Thợ dự kiến đến: {new Date(don.gio_du_kien_den).toLocaleString("vi-VN")}
                </span>
              </div>
            )}

            <div className="flex items-start gap-2.5">
              <span className="text-gray-400 mt-0.5">📍</span>
              <span>{don.dia_chi_hen}</span>
            </div>

            {don.ghi_chu && (
              <div className="flex items-start gap-2.5 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                <span className="text-yellow-600 mt-0.5">📝</span>
                <span className="text-yellow-800 italic">{don.ghi_chu}</span>
              </div>
            )}
          </div>

          {don.trang_thai === "Chờ xác nhận" && (
            <p className="text-sm text-gray-500 border-t pt-4">
              Đơn đang chờ thợ xác nhận. Quay lại link này sau khi thợ nhận đơn để xác nhận hoàn thành và đánh giá nhé.
            </p>
          )}

          {don.trang_thai === "Đã hủy" && (
            <p className="text-sm text-red-600 border-t pt-4">Đơn này đã bị hủy.</p>
          )}

          {coTheXacNhanHoanThanh && (
            <button
              onClick={xacNhanHoanThanh}
              disabled={dangXacNhan}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 border-t-0"
            >
              {dangXacNhan ? "Đang xác nhận..." : "Xác nhận hoàn thành đơn (đã thanh toán)"}
            </button>
          )}

          {don.trang_thai === "Đã xác nhận" && don.khach_xac_nhan_hoan_thanh && !don.tho_xac_nhan_hoan_thanh && (
            <p className="text-sm text-purple-600 bg-purple-50 border border-purple-100 rounded-lg p-3">
              ⏳ Bạn đã xác nhận hoàn thành — đang chờ thợ xác nhận để hoàn tất đơn.
            </p>
          )}

          {don.khach_xac_nhan_hoan_thanh && !daGuiDanhGia && (
            <div className="space-y-3 border-t pt-4">
              <p className="font-medium">Bạn chấm mấy sao cho thợ?</p>
              <div className="flex gap-2 text-3xl">
                {[1, 2, 3, 4, 5].map((sao) => (
                  <button
                    key={sao}
                    onClick={() => setSoSao(sao)}
                    className={sao <= soSao ? "text-yellow-400" : "text-gray-300"}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={binhLuan}
                onChange={(e) => setBinhLuan(e.target.value)}
                placeholder="Nhận xét (không bắt buộc)"
                className="w-full border rounded-lg p-2"
                rows={2}
              />
              <button
                onClick={guiDanhGia}
                disabled={soSao === 0 || dangGui}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50"
              >
                {dangGui ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </div>
          )}

          {daGuiDanhGia && (
            <p className="text-green-600 font-medium border-t pt-4">Cảm ơn bạn đã đánh giá!</p>
          )}
        </div>
      </div>
    </div>
  );
}