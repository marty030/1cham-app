"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type TinNhan = {
  id: number;
  created_at: string;
  tho_id: number;
  sender_type: string; // Đồng bộ tên cột theo Database
  noi_dung: string;
};

export default function TrangLamViecTho() {
  const params = useParams();
  const thoId = params.thoId as string;

  const [danhSachTinNhan, setDanhSachTinNhan] = useState<TinNhan[]>([]);
  const [noiDungMoi, setNoiDungMoi] = useState("");

  // 1. Tải danh sách tin nhắn ban đầu
  const taiTinNhan = async () => {
    if (!thoId) return;

    const { data, error } = await supabase
      .from("tin_nhan")
      .select("*")
      .eq("tho_id", thoId)
      .order("created_at", { ascending: true });

    if (data) setDanhSachTinNhan(data);
    if (error) console.error("Lỗi tải tin nhắn:", error);
  };

  useEffect(() => {
    taiTinNhan();
  }, [thoId]);

  // 2. Lắng nghe Realtime tin nhắn mới từ Khách gửi tới
  useEffect(() => {
    if (!thoId) return;

    const channel = supabase
      .channel(`tho-panel-${thoId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tin_nhan',
          filter: `tho_id=eq.${thoId}`,
        },
        (payload: { new: TinNhan }) => {
          if (payload.new) {
            setDanhSachTinNhan((prev) => {
              const isExist = prev.some((item) => item.id === payload.new.id);
              if (isExist) return prev;
              return [...prev, payload.new];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [thoId]);

  // 3. Thợ gõ tin trả lời
  const guiTinNhanTraLoi = async () => {
    if (!noiDungMoi.trim()) return;

    const currentText = noiDungMoi;
    setNoiDungMoi("");

    const { data, error } = await supabase.from("tin_nhan").insert([
      {
        tho_id: parseInt(thoId),
        sender_type: "tho", // Đã sửa từ nguoi_gui -> sender_type
        noi_dung: currentText,
      },
    ]).select();

    if (error) {
      console.error("Lỗi gửi tin nhắn:", error);
      setNoiDungMoi(currentText);
    } else if (data && data.length > 0) {
      setDanhSachTinNhan((prev) => [...prev, data[0]]);
    }
  };

  return (
    <div className="max-w-md mx-auto border h-screen flex flex-col bg-slate-100">
      {/* Header riêng cho Thợ */}
      <div className="p-4 bg-emerald-700 text-white font-bold flex items-center justify-between shadow">
        <div>
          <h1 className="text-base">🛠️ Bàn làm việc của Thợ #{thoId}</h1>
          <p className="text-xs text-emerald-200">Hộp thư chăm sóc khách hàng</p>
        </div>
      </div>

      {/* Màn hình tin nhắn trao đổi với Khách */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
        {danhSachTinNhan.length === 0 ? (
          <p className="text-center text-gray-400 text-sm mt-10">Chưa có tin nhắn nào từ khách hàng.</p>
        ) : (
          danhSachTinNhan.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-xl max-w-[80%] ${
                msg.sender_type === "tho"
                  ? "bg-emerald-600 text-white self-end rounded-br-none" // Tin Thợ trả lời nằm bên phải
                  : "bg-white text-gray-800 self-start rounded-bl-none shadow-sm" // Tin Khách gửi nằm bên trái
              }`}
            >
              <p className="text-[10px] opacity-75 mb-1 font-semibold">
                {msg.sender_type === "tho" ? "Bạn (Thợ)" : "Khách hàng"}
              </p>
              <p className="text-sm">{msg.noi_dung}</p>
            </div>
          ))
        )}
      </div>

      {/* Ô gõ tin trả lời */}
      <div className="p-3 bg-white border-t flex gap-2">
        <input
          type="text"
          value={noiDungMoi}
          onChange={(e) => setNoiDungMoi(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && guiTinNhanTraLoi()}
          placeholder="Trả lời khách hàng..."
          className="flex-1 border rounded-full px-4 py-2 text-sm outline-none focus:border-emerald-500 text-black"
        />
        <button
          onClick={guiTinNhanTraLoi}
          className="bg-emerald-600 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-emerald-700 transition"
        >
          Gửi
        </button>
      </div>
    </div>
  );
}