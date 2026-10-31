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
 * Tín hiệu cũ của hàm SQL `tim_email_theo_sdt` (tài khoản cũ đăng ký bằng email thật).
 * Bản code này KHÔNG còn dùng nó để rẽ nhánh giao diện (vì làm lộ số nào là tài khoản cũ),
 * nhưng vẫn nhận ra để tương thích khi database chưa cập nhật.
 */
export const TIN_HIEU_CAN_EMAIL = "CAN_EMAIL";

/** Tín hiệu hàm SQL trả về khi một địa chỉ IP tra cứu quá nhiều lần trong thời gian ngắn. */
export const TIN_HIEU_QUA_NHANH = "QUA_NHANH";

export type KetQuaTraEmail = { quaNhanh: false; email: string } | { quaNhanh: true };

/**
 * Tìm email đăng nhập gắn với một số điện thoại.
 *
 * QUAN TRỌNG (chống dò số điện thoại): hàm này LUÔN trả về một email, kể cả khi số điện thoại
 * chưa đăng ký — khi đó dùng email nội bộ suy ra từ số. Nhờ vậy giao diện luôn đi tiếp tới bước
 * đăng nhập bằng mật khẩu, và người lạ chỉ nhận lại một thông báo chung "Sai số điện thoại hoặc
 * mật khẩu", không phân biệt được số đã đăng ký hay chưa.
 *
 * Vẫn cần tra database (thay vì tự suy ra email) vì người dùng có thể đã đổi số điện thoại ở
 * trang Cài đặt, trong khi email đăng nhập nội bộ giữ nguyên theo số cũ.
 */
export async function timEmailDangNhap(soDienThoai: string): Promise<KetQuaTraEmail> {
  const soSach = chuanHoaSdt(soDienThoai);
  const macDinh = taoEmailNoiBo(soSach);

  const { data, error } = await supabase.rpc("tim_email_theo_sdt", {
    so_dien_thoai_input: soSach,
  });

  if (error) {
    console.error("Lỗi tra email theo số điện thoại (RPC):", error);
    return { quaNhanh: false, email: macDinh };
  }

  if (data === TIN_HIEU_QUA_NHANH) return { quaNhanh: true };
  if (!data || data === TIN_HIEU_CAN_EMAIL) return { quaNhanh: false, email: macDinh };
  return { quaNhanh: false, email: data as string };
}

/**
 * Kiểm tra một số điện thoại đã có tài khoản (khách hoặc thợ) hay chưa —
 * dùng để chặn đăng ký trùng. Gọi qua RPC vì RLS chặn đọc ẩn danh.
 *
 * Trả về: true (đã có), false (chưa có hoặc lỗi kỹ thuật — database vẫn chặn trùng ở bước ghi hồ sơ),
 * null (tra cứu quá nhanh, bị giới hạn tạm thời).
 */
export async function daCoTaiKhoanTheoSdt(soDienThoai: string): Promise<boolean | null> {
  const soSach = chuanHoaSdt(soDienThoai);
  if (!soSach) return false;

  const { data, error } = await supabase.rpc("da_co_tai_khoan_theo_sdt", {
    so_dien_thoai_input: soSach,
  });

  if (error) {
    console.error("Lỗi kiểm tra số điện thoại đã tồn tại (RPC):", error);
    return false;
  }

  if (data === null) return null;
  return !!data;
}