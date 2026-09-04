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
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
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
    <header className="bg-card border-b border-line px-6 py-3 flex justify-between items-center sticky top-0 z-50">
      <div
        onClick={() => router.push("/")}
        className="font-bold text-xl text-teal cursor-pointer flex items-center gap-2"
      >
        🔧 SỬA CHỮA-BẢO TRÌ UY TÍN VÀ MINH BẠCH
      </div>

      <div className="flex items-center gap-3">
        {thoId && (
          <button
            onClick={() => router.push(`/tho-panel/${thoId}`)}
            className="bg-teal hover:opacity-90 text-white font-semibold px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition shadow-sm"
          >
            📥 Hộp thư Thợ
          </button>
        )}

        <button
          onClick={moZaloHoTro}
          className="bg-rust-soft hover:opacity-80 text-rust border border-rust/20 font-semibold px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition"
        >
          🆘 Hỗ trợ
        </button>
      </div>
    </header>
  );
}