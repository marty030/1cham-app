// Các cột của bảng tho mà người CHƯA đăng nhập (role anon) được đọc.
// Cố ý không có so_dien_thoai và email_dang_nhap (email nội bộ chứa số điện thoại) và la_admin.
// Khi thêm cột mới vào bảng tho mà trang công khai cần đọc: thêm vào đây VÀ chạy
//   grant select (<cột mới>) on public.tho to anon;
// vì anon chỉ được đọc đúng các cột đã cấp, nên không dùng select("*") trên bảng tho ở trang công khai.
export const COT_THO_CONG_KHAI =
  "id, created_at, ten, nghe, dia_chi, so_don_hoan_thanh, danh_gia_sao, user_id, an_hien, dang_nghi, vi_do, kinh_do, ban_kinh_hoat_dong, danh_muc, anh_dai_dien";