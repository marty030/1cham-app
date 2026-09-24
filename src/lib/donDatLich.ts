import { supabase } from "./supabase";

// Tạo một đơn đặt lịch mới trong bảng don_dat_lich.
// Trả về true nếu tạo thành công, false nếu thất bại (chi tiết lỗi được log ra console).
// Không dùng .select() sau insert: không cần lấy lại dòng vừa tạo, nên cũng không phụ thuộc quyền SELECT của RLS.
export async function taoDonDatLich(duLieuDon: Record<string, unknown>): Promise<boolean> {
  const { error } = await supabase.from("don_dat_lich").insert([duLieuDon]);

  if (error) {
    console.error("Insert don_dat_lich thất bại:", error);
    return false;
  }
  return true;
}