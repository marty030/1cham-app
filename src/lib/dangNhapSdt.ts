import { supabase } from "./supabase";

export function chuanHoaSdt(soDienThoai: string): string {
  return soDienThoai.replace(/\D/g, "");
}

/**
 * Sinh một email nội bộ (không dùng để nhận thư) khi người dùng không nhập
 * email thật lúc đăng ký — Supabase Auth bắt buộc phải có email hoặc SDT đã
 * xác minh OTP để tạo tài khoản, và ở đây ta chưa làm OTP thật, nên dùng
 * email giả này để thỏa yêu cầu của Supabase mà không bắt người dùng phải
 * nhập email thật.
 */
export function taoEmailNoiBo(soDienThoai: string): string {
  return `sdt${chuanHoaSdt(soDienThoai)}@nguoidung.1cham.local`;
}

/**
 * Tìm email đăng nhập (email thật người dùng nhập, hoặc email nội bộ tự
 * sinh) gắn với một số điện thoại — tra theo thứ tự bảng khach rồi đến bảng
 * tho. Dùng để người dùng đăng nhập bằng số điện thoại thay vì phải nhớ
 * email đã dùng lúc đăng ký.
 *
 * Gọi qua RPC (hàm SECURITY DEFINER `tim_email_theo_sdt` ở phía Supabase)
 * thay vì SELECT trực tiếp bảng khach/tho — vì RLS trên 2 bảng này chặn đọc
 * ẩn danh (anon) để bảo vệ số điện thoại khách, và lúc đăng nhập người dùng
 * đang ở trạng thái anon (chưa có phiên) nên SELECT trực tiếp luôn trả về
 * rỗng. Hàm RPC chạy với quyền cao hơn RLS nhưng chỉ trả đúng 1 email, không
 * lộ dữ liệu khác.
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