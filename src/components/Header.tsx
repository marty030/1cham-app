"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "../lib/supabase";
import { Wrench, Inbox, Settings } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [thoId, setThoId] = useState<number | null>(null);
  const [daDangNhap, setDaDangNhap] = useState(false);

  useEffect(() => {
    const kiemTraQuyenTho = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setDaDangNhap(true);

        const { data: thoData } = await supabase
          .from("tho")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (thoData) {
          setThoId(thoData.id);
        }
      } else {
        setDaDangNhap(false);
      }
    };

    kiemTraQuyenTho();
  }, []);

  // Trang chat là giao diện toàn màn hình riêng (có thanh tiêu đề của chính nó),
  // nên ẩn header chung của site để tránh cộng dồn chiều cao vượt quá màn hình.
  const laTrangChatToanManHinh =
    pathname?.startsWith("/chat/") || pathname?.startsWith("/tho-panel/");

  if (laTrangChatToanManHinh) return null;

  return (
        <header className="bg-card border-b border-line px-6 py-2.5 flex justify-between items-center sticky top-0 z-50">
      <div
        onClick={() => router.push("/")}
        className="font-bold text-lg text-teal cursor-pointer flex items-center gap-2"
      >
        <Wrench className="w-5 h-5 shrink-0" />
        Thợ Xịn
      </div>

      <div className="flex items-center gap-3">
        {thoId && (
          <button
            onClick={() => router.push(`/tho-panel/${thoId}`)}
            className="bg-teal hover:opacity-90 text-white font-semibold px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition shadow-sm"
          >
            <Inbox className="w-4 h-4" /> Hộp thư Thợ
          </button>
        )}

        {daDangNhap && (
          <button
            onClick={() => router.push("/cai-dat")}
            className="bg-card border border-line hover:bg-line text-ink-soft font-semibold px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition"
          >
            <Settings className="w-4 h-4" /> Cài đặt
          </button>
        )}
      </div>
    </header>
  );
}