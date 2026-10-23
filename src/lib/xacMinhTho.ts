import { supabase } from "./supabase";
import { thuNhoAnhDaiDien } from "./thuNhoAnh";

export type TrangThaiDuyet = "chua_nop" | "cho_duyet" | "can_bo_sung" | "tu_choi" | "da_duyet";

export const NHAN_TRANG_THAI_DUYET: Record<TrangThaiDuyet, string> = {
  chua_nop: "Chưa nộp hồ sơ",
  cho_duyet: "Chờ duyệt",
  can_bo_sung: "Cần bổ sung",
  tu_choi: "Chưa được duyệt",
  da_duyet: "Đã duyệt",
};

// Kho ảnh RIÊNG TƯ (không công khai) chứa giấy tờ xác minh: <user_id>/<loại>-<thời gian>-<số>.jpg
export const KHO_ANH_XAC_MINH = "xac-minh";

// Thu nhỏ (cạnh dài 1600 px để vẫn đọc rõ giấy tờ), xóa metadata EXIF/GPS rồi tải lên kho riêng. Trả về đường dẫn file.
export async function taiAnhXacMinh(file: File, userId: string, loai: string, stt = 0): Promise<string> {
  const anh = await thuNhoAnhDaiDien(file, 1600, 0.85);
  const duongDan = `${userId}/${loai}-${Date.now()}-${stt}.jpg`;
  const { error } = await supabase.storage
    .from(KHO_ANH_XAC_MINH)
    .upload(duongDan, anh, { upsert: false, contentType: "image/jpeg" });
  if (error) throw error;
  return duongDan;
}

// Xóa MỌI file trong thư mục của một người dùng (dùng khi thợ nộp lại hồ sơ, hoặc khi admin đã quyết định xong).
// Lưu ý: nếu quyền xóa bị từ chối thì Supabase không báo lỗi mà chỉ trả về danh sách rỗng,
// nên phải đối chiếu số file đã xóa với số file cần xóa.
export async function xoaMoiAnhXacMinh(userId: string): Promise<{ thanhCong: boolean; soFile: number }> {
  const { data, error } = await supabase.storage.from(KHO_ANH_XAC_MINH).list(userId, { limit: 200 });
  if (error) return { thanhCong: false, soFile: 0 };

  const duongDan = (data ?? [])
    .filter((f: { name?: string }) => !!f.name && f.name !== ".emptyFolderPlaceholder")
    .map((f: { name: string }) => `${userId}/${f.name}`);
  if (duongDan.length === 0) return { thanhCong: true, soFile: 0 };

  const { data: daXoa, error: loiXoa } = await supabase.storage.from(KHO_ANH_XAC_MINH).remove(duongDan);
  const thanhCong = !loiXoa && (daXoa?.length ?? 0) >= duongDan.length;
  return { thanhCong, soFile: duongDan.length };
}