import { supabase } from "./supabase";
import { PHIEN_BAN_PHAP_LY } from "./thongTinDonVi";

export type VaiTro = "tho" | "khach";

// Các mục BẮT BUỘC phải đánh dấu. Mã này được lưu vào database (cột noi_dung),
// và database cũng tự kiểm tra lại danh sách này (trigger dong_y_truoc_khi_ghi).
export const MUC_BAT_BUOC: Record<VaiTro, string[]> = {
  khach: ["tu_18_tuoi", "dieu_khoan", "bao_mat"],
  tho: ["tu_18_tuoi", "dieu_khoan", "bao_mat", "cong_khai_ho_so_tho"],
};

export function duDongY(vaiTro: VaiTro, daChon: string[]): boolean {
  return MUC_BAT_BUOC[vaiTro].every((muc) => daChon.includes(muc));
}

// Ghi một dòng "đã đồng ý phiên bản X lúc Y". Người dùng và thời điểm do database tự gán.
// themMuc: các mục đồng ý RIÊNG ngoài các mục bắt buộc (ví dụ "xac_minh_danh_tinh" khi thợ nộp hồ sơ xác minh).
export async function ghiNhanDongY(vaiTro: VaiTro, themMuc: string[] = []) {
  return supabase.from("dong_y_phap_ly").insert([
    {
      vai_tro: vaiTro,
      phien_ban: PHIEN_BAN_PHAP_LY.ma,
      noi_dung: [...MUC_BAT_BUOC[vaiTro], ...themMuc],
    },
  ]);
}