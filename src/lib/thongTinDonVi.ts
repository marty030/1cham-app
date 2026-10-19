// ============================================================================
// THÔNG TIN ĐƠN VỊ VẬN HÀNH + CAM KẾT — dùng chung cho các trang pháp lý.
// Điền ĐÚNG SỰ THẬT trước khi mở web công khai. Chỗ nào còn "[CẦN ĐIỀN ...]"
// sẽ hiện nguyên văn trên trang, nên không thể vô tình bỏ sót.
// ============================================================================

export const THONG_TIN_DON_VI = {
  tenNenTang: "Thợ Xịn",
  tenMien: "[CẦN ĐIỀN: tên miền của web]",
  tenChuQuan: "[CẦN ĐIỀN: họ tên cá nhân / tên hộ kinh doanh / tên công ty đứng tên vận hành]",
  loaiHinh: "[CẦN ĐIỀN: cá nhân / hộ kinh doanh / công ty]",
  giayToPhapLy: "[CẦN ĐIỀN: số giấy chứng nhận đăng ký kinh doanh hoặc mã số thuế, ngày cấp, nơi cấp]",
  diaChi: "[CẦN ĐIỀN: địa chỉ trụ sở hoặc địa chỉ liên hệ]",
  soDienThoai: "0865455171", // giống số hỗ trợ ở Footer
  email: "[CẦN ĐIỀN: email hỗ trợ]",
  xacNhanDangKy: "[CẦN ĐIỀN: số xác nhận đăng ký nền tảng thương mại điện tử của Bộ Công Thương, khi đã có]",
};

// Các mức cam kết xử lý — hãy chỉ giữ những con số bạn thực sự làm được.
export const CAM_KET = {
  phanHoiKhieuNaiNgayLamViec: 3, // phản hồi đầu tiên cho khiếu nại
  giaiQuyetKhieuNaiNgay: 15, // giải quyết xong khiếu nại thông thường
  xuLyYeuCauDuLieuNgay: 15, // xử lý yêu cầu rút đồng ý / xóa / chỉnh sửa dữ liệu
  baoSuCoDuLieuGio: 72, // thông báo khi lộ lọt dữ liệu cá nhân
};

// Chính sách phí: sửa lại cho đúng thực tế (và công bố trước khi bắt đầu thu phí).
export const CHINH_SACH_PHI =
  "Hiện tại Nền tảng không thu phí sử dụng đối với Khách và Thợ. Nếu sau này có thu phí, chúng tôi sẽ công bố mức phí, cách tính và thời điểm áp dụng trên Nền tảng trước ít nhất 30 ngày.";

// Đổi mã phiên bản mỗi khi sửa nội dung pháp lý (dùng để ghi nhận người dùng đã đồng ý bản nào).
export const PHIEN_BAN_PHAP_LY = {
  ma: "2026-10-13",
  ngayCapNhat: "13/10/2026",
};