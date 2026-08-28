"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

const SDT_ADMIN = "0865455171"; // Số Zalo admin để nhận báo lỗi/khiếu nại

export default function Header() {
  const router = useRouter();
  const [thoId, setThoId] = useState<number | null>(null);

  useEffect(() => {
    const kiemTraQuyenTho = async () => {
      // 1. Lấy user đang đăng nhập
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // 2. Kiểm tra xem user này có phải là thợ không
        const { data: thoData } = await supabase
          .from("tho")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (thoData) {
          setThoId(thoData.id);
        }
      }
    };

    kiemTraQuyenTho();
  }, []);

  function moZaloHoTro() {
    window.open(`https://zalo.me/${SDT_ADMIN}`, "_blank");
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50">
      {/* Click logo về trang chủ */}
      <div 
        onClick={() => router.push("/")} 
        className="font-bold text-xl text-blue-600 cursor-pointer flex items-center gap-2"
      >
        🔧 Thợ Tốt
      </div>

      <div className="flex items-center gap-3">
        {/* Nút bấm chỉ hiển thị nếu user đăng nhập là Thợ */}
        {thoId && (
          <button
            onClick={() => router.push(`/tho-panel/${thoId}`)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition shadow-sm"
          >
            📥 Hộp thư Thợ
          </button>
        )}

        {/* Nút liên hệ admin khi có sự cố — luôn hiển thị, mọi vai trò */}
        <button
          onClick={moZaloHoTro}
          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition"
        >
          🆘 Hỗ trợ
        </button>
      </div>
    </header>
  );
}