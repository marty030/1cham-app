// Supabase (và Postgres bên dưới) luôn trả lỗi bằng tiếng Anh qua error.message.
// Hàm này dịch các lỗi thường gặp nhất sang tiếng Việt; lỗi lạ chưa gặp thì
// vẫn trả nguyên bản tiếng Anh, còn hơn là giấu mất thông tin gỡ lỗi.
const BANG_DICH: { khop: string; dich: string }[] = [
  { khop: "Invalid login credentials", dich: "Sai số điện thoại hoặc mật khẩu." },
  { khop: "User already registered", dich: "Số điện thoại/email này đã được đăng ký." },
  { khop: "Email not confirmed", dich: "Tài khoản chưa được xác nhận email." },
  { khop: "Password should be at least 6 characters", dich: "Mật khẩu cần ít nhất 6 ký tự." },
  { khop: "New password should be different from the old password", dich: "Mật khẩu mới phải khác mật khẩu cũ." },
  { khop: "duplicate key value violates unique constraint", dich: "Dữ liệu này đã tồn tại, không thể thêm trùng." },
  { khop: "Failed to fetch", dich: "Không kết nối được máy chủ — kiểm tra lại mạng." },
  { khop: "NetworkError", dich: "Không kết nối được máy chủ — kiểm tra lại mạng." },
  { khop: "JWT expired", dich: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại." },
  { khop: "row-level security", dich: "Bạn không có quyền thực hiện thao tác này." },
];

export function dichLoiSupabase(thongBaoGoc: string | null | undefined): string {
  if (!thongBaoGoc) return "Có lỗi xảy ra, vui lòng thử lại.";
  const khopDuoc = BANG_DICH.find((b) => thongBaoGoc.includes(b.khop));
  return khopDuoc ? khopDuoc.dich : thongBaoGoc;
}