// Việt Nam luôn ở UTC+7 quanh năm (không có giờ mùa hè),
// nên có thể dùng offset cố định "+07:00" một cách an toàn.
const MUI_GIO_VN = "+07:00";

/**
 * Trả về ISO string của thời điểm HIỆN TẠI, ghi rõ mốc giờ Việt Nam (+07:00).
 * Dùng thay cho `new Date().toISOString()` (vốn luôn trả UTC) ở mọi chỗ ghi
 * gio_hen/gio_du_kien_den xuống Supabase — tránh bị lệch giờ khi cột DB là
 * kiểu "timestamp without time zone" (Postgres sẽ lưu y nguyên con số, mất
 * thông tin UTC nên bị coi nhầm là giờ VN).
 */
export function isoVietNamHienTai(): string {
  const bayGio = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const p = Object.fromEntries(formatter.formatToParts(bayGio).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}${MUI_GIO_VN}`;
}

/**
 * Ghép ngày ("YYYY-MM-DD") + giờ ("HH:mm") do người dùng chọn (ChonKhungGio)
 * thành ISO string có ghi rõ +07:00, để không phụ thuộc vào múi giờ của
 * trình duyệt/server khi lưu xuống Supabase.
 */
export function taoISOTuVN(ngay: string, gio: string): string {
  return `${ngay}T${gio}:00${MUI_GIO_VN}`;
}

/**
 * Lấy "HH:mm" theo giờ Việt Nam từ một giá trị timestamp bất kỳ trả về từ
 * Supabase — dùng thay cho d.getHours()/d.getMinutes() (vốn dùng múi giờ
 * local của trình duyệt/server, có thể không phải giờ VN).
 */
export function gioPhutVN(gioTri: string | Date): { gio: number; phut: number } {
  const d = typeof gioTri === "string" ? new Date(gioTri) : gioTri;
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const p = Object.fromEntries(formatter.formatToParts(d).map((x) => [x.type, x.value]));
  return { gio: Number(p.hour), phut: Number(p.minute) };
}

/** Tùy chọn timeZone dùng chung cho mọi lệnh gọi toLocaleString/toLocaleDateString/toLocaleTimeString. */
export const TUY_CHON_GIO_VN = { timeZone: "Asia/Ho_Chi_Minh" } as const;