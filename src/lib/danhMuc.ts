export const DANH_MUC_NGHE = [
  { gia_tri: "dien_lanh", nhan: "Điện lạnh" },
  { gia_tri: "dien_nuoc", nhan: "Điện nước" },
  { gia_tri: "do_gia_dung", nhan: "Sửa chữa đồ gia dụng" },
  { gia_tri: "khac", nhan: "Khác" },
] as const;

export type MaDanhMuc = (typeof DANH_MUC_NGHE)[number]["gia_tri"];