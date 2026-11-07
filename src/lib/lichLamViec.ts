// MỘT chỗ duy nhất quy định "một đơn chiếm thợ bao lâu". Con số này dùng cho:
//  - trạng thái "Đang bận" của thợ
//  - cảnh báo "sát giờ đơn bạn đã nhận" trên trang đơn của thợ (chỉ cảnh báo, KHÔNG chặn)
// Bộ chọn giờ của khách KHÔNG dùng nó: khách đặt được mọi khung giờ, chỉ khung đã được thợ
// xác nhận mới bị gạch; thợ tự quyết nhận hay từ chối (kèm lý do) các đơn sát giờ nhau.
// Muốn đổi cách tính thì chỉ sửa 2 số dưới đây.
//
// Lưu ý: hàm SQL khung_gio_ban chỉ trả đơn trong khoảng ±3 giờ quanh hiện tại khi tra cứu
// "thợ nào đang bận", nên THOI_LUONG_DON_PHUT không nên vượt 170 phút.

export const THOI_LUONG_DON_PHUT = 120; // một đơn kéo dài khoảng 2 giờ kể từ giờ hẹn
export const DI_CHUYEN_TRUOC_PHUT = 30; // thợ lên đường trước giờ hẹn bấy nhiêu phút thì đã tính là bận

// Dòng chú thích mờ hiện dưới nhãn "Đang bận", để khách không hiểu nhầm là thợ không nhận việc.
export const GHI_CHU_DANG_BAN = "Thợ vẫn nhận đặt lịch vào giờ khác";

const MOT_PHUT_MS = 60 * 1000;

// Khoảng thời gian (so với hiện tại) cần tải các đơn đã xác nhận để biết thợ có đang bận không.
// Cộng thêm 10 phút dự phòng cho lệch đồng hồ và thời gian mạng.
export const TAI_DON_TRUOC_PHUT = THOI_LUONG_DON_PHUT + 10;
export const TAI_DON_SAU_PHUT = DI_CHUYEN_TRUOC_PHUT + 10;

/** Cặp mốc ISO (từ, đến) để truyền vào hàm SQL khung_gio_ban khi hỏi "thợ nào đang bận lúc này". */
export function khoangTaiDonDangBan(): { tu: string; den: string } {
  const bayGio = Date.now();
  return {
    tu: new Date(bayGio - TAI_DON_TRUOC_PHUT * MOT_PHUT_MS).toISOString(),
    den: new Date(bayGio + TAI_DON_SAU_PHUT * MOT_PHUT_MS).toISOString(),
  };
}

/**
 * Thợ có đang bận tại thời điểm `bayGio` không?
 * Bận từ (giờ hẹn − thời gian đi đường) đến (giờ hẹn + thời lượng đơn), tính cho từng đơn đã xác nhận.
 */
export function dangBanTaiThoiDiem(
  gioHenCacDonDaXacNhan: Array<string | Date>,
  bayGio: Date = new Date()
): boolean {
  const bayGioMs = bayGio.getTime();
  return gioHenCacDonDaXacNhan.some((g) => {
    const gioHenMs = new Date(g).getTime();
    if (isNaN(gioHenMs)) return false;
    return (
      bayGioMs >= gioHenMs - DI_CHUYEN_TRUOC_PHUT * MOT_PHUT_MS &&
      bayGioMs < gioHenMs + THOI_LUONG_DON_PHUT * MOT_PHUT_MS
    );
  });
}

/** Hai đơn hẹn lúc `a` và `b` có chiếm thời gian chồng lên nhau không (mỗi đơn kéo dài THOI_LUONG_DON_PHUT)? */
export function satGioNhau(a: Date, b: Date): boolean {
  return Math.abs(a.getTime() - b.getTime()) < THOI_LUONG_DON_PHUT * MOT_PHUT_MS;
}