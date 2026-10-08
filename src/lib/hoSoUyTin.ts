// Cấp độ và huy hiệu của thợ — dùng chung cho trang công khai /tho/[id] (khách xem)
// và khối "Hồ sơ của tôi" ở trang đơn của thợ, để hai nơi luôn cho cùng một kết quả.

export const CAC_CAP_DO = [
  { nguong: 0, ten: "Thợ mới" },
  { nguong: 5, ten: "Thợ cứng tay" },
  { nguong: 15, ten: "Thợ lành nghề" },
  { nguong: 30, ten: "Thợ chuyên nghiệp" },
  { nguong: 60, ten: "Chuyên gia" },
  { nguong: 100, ten: "Bậc thầy" },
];

export function tinhCapDo(soDon: number) {
  let hienTai = CAC_CAP_DO[0];
  let ke = CAC_CAP_DO[1] ?? null;
  for (let i = 0; i < CAC_CAP_DO.length; i++) {
    if (soDon >= CAC_CAP_DO[i].nguong) {
      hienTai = CAC_CAP_DO[i];
      ke = CAC_CAP_DO[i + 1] ?? null;
    }
  }
  const phanTram = ke
    ? Math.min(100, Math.round(((soDon - hienTai.nguong) / (ke.nguong - hienTai.nguong)) * 100))
    : 100;
  return { hienTai, ke, phanTram };
}

export function tinhHuyHieu(soDon: number, saoTrungBinh: number, soDanhMuc: number) {
  const huyHieu: { ten: string; icon: string }[] = [];
  if (soDon >= 1) huyHieu.push({ ten: "Đơn đầu tiên", icon: "🎉" });
  if (soDon >= 10) huyHieu.push({ ten: "10 đơn hoàn thành", icon: "🥉" });
  if (soDon >= 50) huyHieu.push({ ten: "50 đơn hoàn thành", icon: "🥈" });
  if (soDon >= 100) huyHieu.push({ ten: "100 đơn hoàn thành", icon: "🥇" });
  if (soDon >= 5 && saoTrungBinh >= 4.5) huyHieu.push({ ten: "Được yêu thích", icon: "❤️" });
  if (soDanhMuc >= 2) huyHieu.push({ ten: "Đa năng", icon: "🧰" });
  return huyHieu;
}