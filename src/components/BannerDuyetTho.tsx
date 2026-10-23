"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { TrangThaiDuyet } from "../lib/xacMinhTho";

// Trang không hiện banner (đang ở đúng nơi xử lý, hoặc chưa đăng nhập)
const TRANG_BO_QUA = ["/xac-minh", "/admin/duyet-tho", "/login", "/dang-ky"];

type NoiDung = { chu: string; nut: string; duongDan: string };

const NOI_DUNG_THO: Record<Exclude<TrangThaiDuyet, "da_duyet">, NoiDung> = {
  chua_nop: {
    chu: "Hồ sơ thợ của bạn chưa hiển thị công khai. Hãy nộp hồ sơ xác minh để được duyệt.",
    nut: "Nộp hồ sơ",
    duongDan: "/xac-minh",
  },
  cho_duyet: {
    chu: "Hồ sơ xác minh của bạn đang chờ duyệt. Khi được duyệt, bạn sẽ hiện công khai.",
    nut: "Xem trạng thái",
    duongDan: "/xac-minh",
  },
  can_bo_sung: {
    chu: "Hồ sơ xác minh của bạn cần bổ sung thêm thông tin.",
    nut: "Bổ sung ngay",
    duongDan: "/xac-minh",
  },
  tu_choi: {
    chu: "Hồ sơ xác minh của bạn chưa được duyệt.",
    nut: "Xem lý do",
    duongDan: "/xac-minh",
  },
};

// Thanh nhắc ở đầu trang: thợ chưa được duyệt thấy việc cần làm; admin thấy số hồ sơ đang chờ duyệt.
export default function BannerDuyetTho() {
  const pathname = usePathname();
  const [noiDung, setNoiDung] = useState<NoiDung | null>(null);
  const boQua = TRANG_BO_QUA.some((trang) => pathname.startsWith(trang));

  useEffect(() => {
    if (boQua) return;
    let daHuy = false;

    async function kiemTra() {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) {
        if (!daHuy) setNoiDung(null);
        return;
      }

      if (user.app_metadata?.role === "admin") {
        const { count } = await supabase
          .from("tho")
          .select("id", { count: "exact", head: true })
          .eq("trang_thai_duyet", "cho_duyet");
        if (daHuy) return;
        setNoiDung(
          count && count > 0
            ? { chu: `Có ${count} hồ sơ thợ đang chờ bạn duyệt.`, nut: "Duyệt thợ", duongDan: "/admin/duyet-tho" }
            : null
        );
        return;
      }

      const { data: tho } = await supabase
        .from("tho")
        .select("trang_thai_duyet")
        .eq("user_id", user.id)
        .limit(1);
      if (daHuy) return;
      const trangThai = tho?.[0]?.trang_thai_duyet as TrangThaiDuyet | undefined;
      setNoiDung(trangThai && trangThai !== "da_duyet" ? NOI_DUNG_THO[trangThai] : null);
    }

    kiemTra();
    const { data: dangKy } = supabase.auth.onAuthStateChange(() => {
      kiemTra();
    });
    return () => {
      daHuy = true;
      dangKy.subscription.unsubscribe();
    };
  }, [pathname, boQua]);

  if (!noiDung || boQua) return null;

  return (
    <div className="bg-gold-soft border-b border-gold/30 px-4 py-2.5">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-sm">
        <span className="flex items-center gap-1.5 text-ink">
          <ShieldAlert className="w-4 h-4 text-gold shrink-0" />
          {noiDung.chu}
        </span>
        <Link href={noiDung.duongDan} className="font-semibold text-rust hover:underline">
          {noiDung.nut} →
        </Link>
      </div>
    </div>
  );
}