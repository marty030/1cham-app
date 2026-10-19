"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabase";
import { PHIEN_BAN_PHAP_LY } from "../lib/thongTinDonVi";
import { ghiNhanDongY, duDongY, type VaiTro } from "../lib/dongYPhapLy";
import { dichLoiSupabase } from "../lib/dichLoi";
import KhoiDongY from "./KhoiDongY";

// Trang không hiện cổng: người dùng đang đọc văn bản pháp lý, hoặc đang đăng ký / đăng nhập
// (đăng ký tự ghi nhận sự đồng ý riêng, nếu hiện cổng ở đây sẽ nháy lên giữa lúc đăng ký).
const TRANG_BO_QUA = ["/dieu-khoan", "/bao-mat", "/quy-che", "/dang-ky", "/login"];

// Cổng xin đồng ý: hiện khi người đang đăng nhập CHƯA đồng ý phiên bản văn bản hiện hành
// (tài khoản cũ, đăng ký mà chưa ghi nhận được, hoặc sau khi bạn đổi PHIEN_BAN_PHAP_LY).
export default function CongDongYPhapLy() {
  const pathname = usePathname();
  const [canHoi, setCanHoi] = useState<VaiTro | null>(null);
  const [daChon, setDaChon] = useState<string[]>([]);
  const [dangLuu, setDangLuu] = useState(false);
  const [daCham, setDaCham] = useState(false);
  const [loi, setLoi] = useState("");

  const boQua = TRANG_BO_QUA.some((trang) => pathname.startsWith(trang));

  useEffect(() => {
    if (boQua) return;
    let daHuy = false;

    async function kiemTra() {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) {
        if (!daHuy) setCanHoi(null);
        return;
      }

      const [thoRes, dongYRes] = await Promise.all([
        supabase.from("tho").select("id").eq("user_id", user.id).limit(1),
        supabase
          .from("dong_y_phap_ly")
          .select("phien_ban, noi_dung")
          .eq("user_id", user.id)
          .order("dong_y_luc", { ascending: false })
          .limit(1),
      ]);
      if (daHuy) return;

      // Nếu không đọc được bảng đồng ý (ví dụ chưa chạy SQL) thì không khóa người dùng lại.
      if (dongYRes.error) {
        console.error("Không kiểm tra được sự đồng ý:", dongYRes.error);
        setCanHoi(null);
        return;
      }

      const vaiTro: VaiTro = thoRes.data && thoRes.data.length > 0 ? "tho" : "khach";
      const moiNhat = dongYRes.data?.[0];
      const daDu =
        !!moiNhat &&
        moiNhat.phien_ban === PHIEN_BAN_PHAP_LY.ma &&
        duDongY(vaiTro, moiNhat.noi_dung ?? []);
      setCanHoi(daDu ? null : vaiTro);
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

  async function dongY() {
    if (!canHoi) return;
    setDaCham(true);
    setLoi("");
    if (!duDongY(canHoi, daChon)) return;

    setDangLuu(true);
    const { error } = await ghiNhanDongY(canHoi);
    setDangLuu(false);
    if (error) {
      setLoi("Không lưu được sự đồng ý: " + dichLoiSupabase(error.message));
      return;
    }
    setCanHoi(null);
    setDaChon([]);
    setDaCham(false);
  }

  async function dangXuat() {
    await supabase.auth.signOut();
    setCanHoi(null);
    window.location.href = "/";
  }

  if (!canHoi || boQua) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-line p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold text-ink">Cập nhật điều khoản và chính sách</h2>
          <p className="text-sm text-ink-soft mt-1 leading-relaxed">
            Thợ Xịn có Điều khoản sử dụng, Quy chế hoạt động và Chính sách bảo vệ dữ liệu cá nhân (phiên bản{" "}
            {PHIEN_BAN_PHAP_LY.ma}). Vui lòng đọc và đồng ý để tiếp tục sử dụng.
          </p>
        </div>

        <KhoiDongY
          vaiTro={canHoi}
          daChon={daChon}
          onDoi={setDaChon}
          hienLoi={daCham && !duDongY(canHoi, daChon)}
        />

        {loi && <p className="text-xs text-rust">{loi}</p>}

        <div className="flex flex-col gap-2">
          <button
            onClick={dongY}
            disabled={dangLuu}
            className="bg-rust hover:opacity-90 text-white py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 transition"
          >
            {dangLuu ? "Đang lưu..." : "Đồng ý và tiếp tục"}
          </button>
          <button
            onClick={dangXuat}
            disabled={dangLuu}
            className="text-xs font-semibold text-ink-soft border border-line hover:bg-line py-2 rounded-lg transition"
          >
            Không đồng ý, đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}