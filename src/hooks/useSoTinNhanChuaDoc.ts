"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { HoSoKhach } from "../lib/khach";
import { useLuotQuayLaiUngDung } from "./useLuotQuayLaiUngDung";

// Đếm số HỘI THOẠI đang có tin nhắn chưa đọc (không phải số tin nhắn) để hiện
// chấm đỏ ở nút "Tin nhắn" / "Hộp thư Thợ" — dựa vào cột tin_nhan.da_doc.
// Tính lại khi trang tải, khi trạng thái đăng nhập đổi, và khi người dùng quay lại ứng dụng
// (từ tab khác / từ nền trên điện thoại). Chưa realtime: đang mở sẵn app mà có tin mới thì
// chấm đỏ cập nhật ở lần quay lại hoặc tải lại tiếp theo.
export function useSoTinNhanChuaDoc(
  daDangNhap: boolean,
  hoSoKhach: HoSoKhach | null,
  currentUserId: string | null
) {
  const [soHoiThoai, setSoHoiThoai] = useState(0);
  const luotQuayLai = useLuotQuayLaiUngDung();

  useEffect(() => {
    let huy = false;

    async function dem() {
      if (!daDangNhap) {
        setSoHoiThoai(0);
        return;
      }

      if (hoSoKhach) {
        const { data } = await supabase
          .from("tin_nhan")
          .select("tho_id")
          .eq("khach_id", hoSoKhach.id)
          .eq("sender_type", "tho")
          .eq("da_doc", false);
        if (!huy) setSoHoiThoai(new Set((data || []).map((d) => d.tho_id)).size);
        return;
      }

      if (currentUserId) {
        const { data: hoSoTho } = await supabase
          .from("tho")
          .select("id")
          .eq("user_id", currentUserId)
          .maybeSingle();

        if (!hoSoTho) {
          if (!huy) setSoHoiThoai(0);
          return;
        }

        const { data } = await supabase
          .from("tin_nhan")
          .select("khach_id")
          .eq("tho_id", hoSoTho.id)
          .eq("sender_type", "khach")
          .eq("da_doc", false);
        if (!huy) setSoHoiThoai(new Set((data || []).map((d) => d.khach_id)).size);
        return;
      }

      if (!huy) setSoHoiThoai(0);
    }

    dem();
    return () => {
      huy = true;
    };
  }, [daDangNhap, hoSoKhach, currentUserId, luotQuayLai]);

  return soHoiThoai;
}