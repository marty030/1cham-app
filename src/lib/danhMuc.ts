export const DANH_MUC_NGHE = [
  { gia_tri: "dien_lanh", nhan: "Điện lạnh" },
  { gia_tri: "dien_nuoc", nhan: "Điện nước" },
  { gia_tri: "do_gia_dung", nhan: "Sửa chữa đồ gia dụng" },
  { gia_tri: "bep_dien", nhan: "Sửa bếp điện, bếp từ" },
  { gia_tri: "thong_cong", nhan: "Thông cống, hút bể phốt" },
  { gia_tri: "chong_tham", nhan: "Chống thấm, chống dột" },
  { gia_tri: "son_sua_nha", nhan: "Sơn, sửa chữa nhà" },
  { gia_tri: "pha_khoa", nhan: "Phá khóa" },
  { gia_tri: "cua_cuon_cua_kinh", nhan: "Cửa cuốn, cửa kính" },
  { gia_tri: "camera_wifi", nhan: "Lắp camera, wifi" },
  { gia_tri: "tivi_dien_tu", nhan: "Sửa tivi, điện tử" },
  { gia_tri: "may_tinh", nhan: "Sửa máy tính, laptop" },
  { gia_tri: "khac", nhan: "Khác" },
] as const;

export type MaDanhMuc = (typeof DANH_MUC_NGHE)[number]["gia_tri"];