"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { HoSoKhach } from "../lib/khach";
import { useLuotQuayLaiUngDung } from "./useLuotQuayLaiUngDung";

// Đếm số đơn "cần bạn xử lý ngay" để hiện chấm đỏ ở nút "Đơn của tôi" —
// tính thẳng từ các cột trạng thái có sẵn, không cần thêm bảng/cột mới:
//  - Khách: đơn thợ đã xác nhận hoàn thành nhưng khách chưa xác nhận (cần khách bấm xác nhận).
//  - Thợ: đơn đang "Chờ xác nhận" (cần thợ phản hồi).
// Tính lại khi trang tải, khi trạng thái đăng nhập đổi, và khi người dùng quay lại ứng dụng
// (từ tab khác / từ nền trên điện thoại). Chưa realtime: đang mở sẵn app mà có đơn mới thì
// chấm đỏ cập nhật ở lần quay lại hoặc tải lại tiếp theo.
export function useSoDonCanXuLy(
  daDangNhap: boolean,
  hoSoKhach: HoSoKhach | null,
  currentUserId: string | null
) {
  const [soDon, setSoDon] = useState(0);
  const luotQuayLai = useLuotQuayLaiUngDung();

  useEffect(() => {
    let huy = false;

    async function dem() {
      if (!daDangNhap) {
        setSoDon(0);
        return;
      }

      if (hoSoKhach) {
        const { count } = await supabase
          .from("don_dat_lich")
          .select("id", { count: "exact", head: true })
          .eq("khach_id", hoSoKhach.id)
          .eq("tho_xac_nhan_hoan_thanh", true)
          .or("khach_xac_nhan_hoan_thanh.is.null,khach_xac_nhan_hoan_thanh.eq.false");
        if (!huy) setSoDon(count ?? 0);
        return;
      }

      if (currentUserId) {
        const { data: hoSoTho } = await supabase
          .from("tho")
          .select("id")
          .eq("user_id", currentUserId)
          .maybeSingle();

        if (!hoSoTho) {
          if (!huy) setSoDon(0);
          return;
        }

        const { count } = await supabase
          .from("don_dat_lich")
          .select("id", { count: "exact", head: true })
          .eq("tho_id", hoSoTho.id)
          .eq("trang_thai", "Chờ xác nhận");
        if (!huy) setSoDon(count ?? 0);
        return;
      }

      if (!huy) setSoDon(0);
    }

    dem();
    return () => {
      huy = true;
    };
  }, [daDangNhap, hoSoKhach, currentUserId, luotQuayLai]);

  return soDon;
}