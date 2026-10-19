import { supabase } from "./supabase";

export function chuanHoaSdt(soDienThoai: string): string {
  return soDienThoai.replace(/\D/g, "");
}

/**
 * Kiểm tra số điện thoại đủ 10 chữ số và bắt đầu bằng 0 (đúng định dạng số
 * di động Việt Nam hiện hành) — dùng để tô viền đỏ khi người dùng nhập thiếu
 * hoặc sai định dạng, trước khi kịp bấm nút gửi.
 */
export function sdtHopLe(soDienThoai: string): boolean {
  const soSach = chuanHoaSdt(soDienThoai);
  return /^0\d{9}$/.test(soSach);
}

/**
 * Sinh email nội bộ (không dùng để nhận thư) cho mọi tài khoản đăng ký mới —
 * Supabase Auth bắt buộc phải có email hoặc SDT đã xác minh OTP để tạo tài
 * khoản, và ở đây ta chưa làm OTP thật, nên dùng email giả này. Web không thu
 * email thật nữa (không dùng vào việc gì, thu thêm chỉ tăng rủi ro dữ liệu).
 */
export function taoEmailNoiBo(soDienThoai: string): string {
  return `sdt${chuanHoaSdt(soDienThoai)}@nguoidung.1cham.local`;
}

/**
 * Tín hiệu hàm SQL `tim_email_theo_sdt` trả về khi tài khoản được đăng ký bằng
 * email thật (tài khoản cũ). Vì lý do riêng tư, database KHÔNG trả email thật
 * cho người chưa đăng nhập; trang đăng nhập sẽ yêu cầu người dùng tự nhập email.
 */
export const TIN_HIEU_CAN_EMAIL = "CAN_EMAIL";

/**
 * Tìm email đăng nhập gắn với một số điện thoại — tra theo thứ tự bảng khach
 * rồi đến bảng tho. Trả về: email nội bộ (sdt…@nguoidung.1cham.local), hoặc
 * TIN_HIEU_CAN_EMAIL nếu tài khoản dùng email thật, hoặc null nếu không có.
 *
 * Gọi qua RPC (hàm SECURITY DEFINER `tim_email_theo_sdt` ở phía Supabase)
 * thay vì SELECT trực tiếp bảng khach/tho — vì RLS trên 2 bảng này chặn đọc
 * ẩn danh (anon) để bảo vệ số điện thoại khách, và lúc đăng nhập người dùng
 * đang ở trạng thái anon (chưa có phiên) nên SELECT trực tiếp luôn trả về
 * rỗng. Hàm RPC chạy với quyền cao hơn RLS nhưng chỉ trả đúng 1 email, không
 * lộ dữ liệu khác (và không bao giờ trả email thật).
 */
export async function timEmailTheoSoDienThoai(soDienThoai: string): Promise<string | null> {
  const soSach = chuanHoaSdt(soDienThoai);
  if (!soSach) return null;

  const { data, error } = await supabase.rpc("tim_email_theo_sdt", {
    so_dien_thoai_input: soSach,
  });

  if (error) {
    console.error("Lỗi tra email theo số điện thoại (RPC):", error);
    return null;
  }

  return data || null;
}

/**
 * Kiểm tra một số điện thoại đã có tài khoản (khách hoặc thợ) hay chưa —
 * dùng để chặn đăng ký trùng. Cũng gọi qua RPC vì lý do RLS như trên.
 */
export async function daCoTaiKhoanTheoSdt(soDienThoai: string): Promise<boolean> {
  const soSach = chuanHoaSdt(soDienThoai);
  if (!soSach) return false;

  const { data, error } = await supabase.rpc("da_co_tai_khoan_theo_sdt", {
    so_dien_thoai_input: soSach,
  });

  if (error) {
    console.error("Lỗi kiểm tra số điện thoại đã tồn tại (RPC):", error);
    return false;
  }

  return !!data;
}