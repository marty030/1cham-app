// Các hàm làm việc với giờ hẹn (gio_hen). Cột DB lưu giờ Việt Nam KHÔNG kèm múi giờ,
// nên mọi phép so sánh với "bây giờ" đều quy về chuỗi "YYYY-MM-DDTHH:mm" theo giờ VN
// (chuỗi dạng này so sánh theo thứ tự chữ cái là đúng thứ tự thời gian).

const CO_MUI_GIO = /([zZ]|[+-]\d{2}:?\d{2})$/;
const MS_MOT_NGAY = 24 * 60 * 60 * 1000;

// Mốc nhắc đơn bị bỏ quên — chỉnh ở đây nếu muốn đổi số ngày.
export const NGAY_NHAC_CHO_XAC_NHAN = 2; // đơn "Chờ xác nhận" quá số ngày này kể từ lúc đặt
export const NGAY_NHAC_SAU_GIO_HEN = 3; // đơn "Đã xác nhận" quá số ngày này kể từ giờ hẹn
export const NGAY_BAO_VAN_DE_SAU_HOAN_THANH = 7; // còn được báo vấn đề trong số ngày này sau khi hoàn thành
export const PHUT_CHO_DON_MOI = 60; // đơn mới tạo dưới số phút này thì chưa nhắc gì cả

function dinhDangVN(d: Date): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(d)
      .map((x) => [x.type, x.value])
  );
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** Đổi gio_hen (có hoặc không có múi giờ) về "YYYY-MM-DDTHH:mm" theo giờ VN. Rỗng nếu không đọc được. */
export function gioHenSangChuoiVN(gioHen: string | null | undefined): string {
  if (!gioHen) return "";
  if (CO_MUI_GIO.test(gioHen)) {
    const d = new Date(gioHen);
    return isNaN(d.getTime()) ? "" : dinhDangVN(d);
  }
  return gioHen.replace(" ", "T").slice(0, 16);
}

/** Dạng ISO có ghi rõ +07:00 (đúng định dạng ChonKhungGio nhận và trả). */
export function gioHenSangISOVN(gioHen: string | null | undefined): string {
  const s = gioHenSangChuoiVN(gioHen);
  return s ? `${s}:00+07:00` : "";
}

export function bayGioVN(): string {
  return dinhDangVN(new Date());
}

/** true nếu đã tới (hoặc qua) giờ hẹn. Không có giờ hẹn thì coi như đã tới. */
export function daToiGioHen(gioHen: string | null | undefined): boolean {
  const s = gioHenSangChuoiVN(gioHen);
  if (!s) return true;
  return s <= bayGioVN();
}

/** Nhãn "mở khóa lúc nào" cho nút hoàn thành: "15:30" nếu hôm nay, "15:30 08/10" nếu ngày khác. */
export function nhanMoKhoa(gioHen: string | null | undefined): string {
  const s = gioHenSangChuoiVN(gioHen);
  if (!s) return "";
  const gio = s.slice(11);
  return s.slice(0, 10) === bayGioVN().slice(0, 10) ? gio : `${gio} ${s.slice(8, 10)}/${s.slice(5, 7)}`;
}

// Các cột thời điểm do database tự ghi (tao_luc, hoan_thanh_luc) có thể về dạng có múi giờ
// ("...+00:00") hoặc không có ("YYYY-MM-DDTHH:mm:ss"). Dạng không có múi giờ là giờ UTC của
// now() nên phải gắn "Z"; nếu để nguyên, trình duyệt sẽ hiểu nhầm là giờ máy và lệch 7 tiếng.
function msThoiDiemHeThong(giaTri: string | null | undefined): number {
  if (!giaTri) return NaN;
  const s = CO_MUI_GIO.test(giaTri) ? giaTri : `${giaTri.replace(" ", "T")}Z`;
  return Date.parse(s);
}

/** Đơn còn trong thời hạn báo vấn đề không (khớp luật ở database). */
export function conTrongHanBaoVanDe(don: {
  trang_thai: string;
  hoan_thanh_luc?: string | null;
}): boolean {
  if (don.trang_thai === "Đã xác nhận") return true;
  if (don.trang_thai !== "Đã hoàn thành" || !don.hoan_thanh_luc) return false;
  const t = msThoiDiemHeThong(don.hoan_thanh_luc);
  if (isNaN(t)) return false;
  return Date.now() - t <= NGAY_BAO_VAN_DE_SAU_HOAN_THANH * MS_MOT_NGAY;
}

function msGioHen(gioHen: string | null | undefined): number {
  const s = gioHenSangChuoiVN(gioHen);
  return s ? Date.parse(`${s}:00+07:00`) : NaN;
}

/**
 * Lời nhắc cho đơn bị bỏ quên, tính theo GIỜ HẸN chứ không theo ngày đặt/xác nhận:
 * đơn hẹn 4 ngày nữa mà đã xác nhận thì chưa có gì để nhắc.
 * Trả về null nếu đơn không cần nhắc.
 */
export function layNhacDon(don: any, vaiTro: "tho" | "khach"): string | null {
  const bayGio = Date.now();
  const gioHenMs = msGioHen(don.gio_hen);

  if (don.trang_thai === "Chờ xác nhận") {
    const taoLuc = msThoiDiemHeThong(don.tao_luc);
    const tuoiDonMs = bayGio - taoLuc; // NaN nếu không đọc được tao_luc
    // Đơn mới tạo thì chưa có gì để nhắc
    const daDuTuoi = isNaN(tuoiDonMs) || tuoiDonMs > PHUT_CHO_DON_MOI * 60 * 1000;

    // Mốc 1: giờ hẹn đã qua. CHỈ áp cho đơn khách chọn giờ ("gio_khac"). Đơn "gọi ngay" có
    // gio_hen = đúng lúc tạo đơn nên luôn "đã qua" ngay sau đó — không phải đơn bị bỏ quên.
    if (don.che_do_dat_lich === "gio_khac" && daDuTuoi && !isNaN(gioHenMs) && gioHenMs < bayGio) {
      return vaiTro === "tho"
        ? "Giờ hẹn đã qua mà đơn chưa được xác nhận — hãy xác nhận hoặc không nhận đơn."
        : "Giờ hẹn đã qua mà thợ chưa xác nhận — bạn nên hủy đơn và đặt lại.";
    }
    // Mốc 2: chờ quá lâu kể từ lúc đặt (áp cho mọi loại đơn)
    if (!isNaN(tuoiDonMs) && tuoiDonMs > NGAY_NHAC_CHO_XAC_NHAN * MS_MOT_NGAY) {
      return vaiTro === "tho"
        ? `Đơn đã chờ bạn phản hồi hơn ${NGAY_NHAC_CHO_XAC_NHAN} ngày.`
        : `Thợ chưa phản hồi sau hơn ${NGAY_NHAC_CHO_XAC_NHAN} ngày — bạn có thể hủy đơn và chọn thợ khác.`;
    }
    return null;
  }

  if (
    don.trang_thai === "Đã xác nhận" &&
    !isNaN(gioHenMs) &&
    bayGio - gioHenMs > NGAY_NHAC_SAU_GIO_HEN * MS_MOT_NGAY
  ) {
    const toiDaBam = vaiTro === "tho" ? don.tho_xac_nhan_hoan_thanh : don.khach_xac_nhan_hoan_thanh;
    const beKiaDaBam = vaiTro === "tho" ? don.khach_xac_nhan_hoan_thanh : don.tho_xac_nhan_hoan_thanh;
    if (!toiDaBam) {
      return beKiaDaBam
        ? "Bên kia đã xác nhận hoàn thành từ lâu — đang chờ bạn xác nhận."
        : `Đơn đã quá giờ hẹn hơn ${NGAY_NHAC_SAU_GIO_HEN} ngày mà chưa hoàn thành — hãy xác nhận hoàn thành, hoặc hủy đơn nếu việc không diễn ra.`;
    }
    return `Bạn đã xác nhận hoàn thành nhưng bên kia chưa xác nhận sau hơn ${NGAY_NHAC_SAU_GIO_HEN} ngày — hãy nhắc họ, hoặc báo vấn đề nếu có bất đồng.`;
  }

  return null;
}