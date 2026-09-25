"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { taoDonDatLich } from "../lib/donDatLich";
import { isoVietNamHienTai } from "../lib/thoiGianVN";
import { HoSoKhach } from "../lib/khach";
import { useThongBao } from "../components/ThongBao";

type ThoDatLich = {
  id: number | string;
  so_dien_thoai?: string | null;
};

type TuyChon = {
  // Hồ sơ khách đang đăng nhập (null nếu chưa đăng nhập / không phải tài khoản khách)
  hoSoKhach: HoSoKhach | null;
  // Đường dẫn để quay lại sau khi đăng nhập xong (nên gồm cả query, ví dụ /tho-gan-ban?danh_muc=dien)
  duongDanQuayLai: string;
  // Ngành của đơn: lưu vào cột danh_muc của don_dat_lich, null nếu không xác định
  danhMuc: string | null;
};

export function useDatLich({ hoSoKhach, duongDanQuayLai, danhMuc }: TuyChon) {
  const router = useRouter();
  const thongBao = useThongBao();

  const [tenKhach, setTenKhach] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [gioHenDayDu, setGioHenDayDu] = useState("");
  const [diaChiHen, setDiaChiHen] = useState("");
  const [ghiChu, setGhiChu] = useState("");

  function chuyenDenDangNhap() {
    router.push(`/login?next=${encodeURIComponent(duongDanQuayLai)}`);
  }

  function xoaForm() {
    setTenKhach("");
    setSoDienThoai("");
    setGioHenDayDu("");
    setDiaChiHen("");
    setGhiChu("");
  }

  // Gọi khi khách bấm "Đặt lịch". Trả về true nếu được phép mở form
  // (đã điền sẵn tên + SĐT từ hồ sơ), false nếu phải đăng nhập trước.
  function batDau(): boolean {
    if (!hoSoKhach) {
      thongBao("Vui lòng đăng nhập bằng tài khoản khách hàng trước khi đặt lịch.", "canhbao");
      chuyenDenDangNhap();
      return false;
    }
    setTenKhach(hoSoKhach.ten || "");
    setSoDienThoai(hoSoKhach.so_dien_thoai || "");
    return true;
  }

  // Khách bấm Hủy trên form (trang tự đóng form của mình)
  function huy() {
    setTenKhach("");
    setSoDienThoai("");
  }

  // Đặt lịch theo giờ khách chọn. dongForm: hàm để trang tự đóng form của nó.
  async function xacNhan(tho: ThoDatLich, dongForm: () => void) {
    if (!gioHenDayDu) {
      thongBao("Vui lòng chọn ngày & giờ hẹn.", "canhbao");
      return;
    }
    if (!hoSoKhach) {
      thongBao("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.", "canhbao");
      chuyenDenDangNhap();
      return;
    }

    const thanhCong = await taoDonDatLich({
      ten_khach: tenKhach,
      so_dien_thoai: soDienThoai,
      khach_id: hoSoKhach.id,
      tho_id: tho.id,
      gio_hen: gioHenDayDu,
      dia_chi_hen: diaChiHen,
      ghi_chu: ghiChu,
      danh_muc: danhMuc,
      che_do_dat_lich: "gio_khac",
    });

    if (!thanhCong) {
      thongBao("Đặt lịch thất bại, vui lòng thử lại. (Chi tiết lỗi xem ở Console - F12)", "loi");
      return;
    }

    dongForm();
    xoaForm();
    thongBao("Đặt lịch thành công!", "thanhcong");
    router.push("/don-cua-toi-khach");
  }

  // Gọi thợ ngay bây giờ: tạo đơn "Chờ xác nhận" rồi mở Zalo của thợ.
  async function goiNgay(tho: ThoDatLich, dongForm: () => void) {
    if (!tenKhach || !soDienThoai || !diaChiHen) {
      thongBao("Vui lòng điền đủ họ tên, số điện thoại và địa chỉ trước khi gọi.", "canhbao");
      return;
    }
    if (!hoSoKhach) {
      thongBao("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.", "canhbao");
      chuyenDenDangNhap();
      return;
    }

    const thanhCong = await taoDonDatLich({
      ten_khach: tenKhach,
      so_dien_thoai: soDienThoai,
      khach_id: hoSoKhach.id,
      tho_id: tho.id,
      gio_hen: isoVietNamHienTai(),
      dia_chi_hen: diaChiHen,
      ghi_chu: ghiChu,
      trang_thai: "Chờ xác nhận",
      danh_muc: danhMuc,
      che_do_dat_lich: "ngay_bay_gio",
    });

    if (!thanhCong) {
      thongBao("Tạo đơn thất bại, vui lòng thử lại. (Chi tiết lỗi xem ở Console - F12)", "loi");
      return;
    }

    dongForm();
    xoaForm();

    if (!tho.so_dien_thoai) {
      thongBao("Đã tạo yêu cầu! Thợ này chưa cập nhật số điện thoại, vui lòng chờ thợ liên hệ lại.", "loi");
    } else {
      const soSach = tho.so_dien_thoai.replace(/\D/g, "");
      window.open(`https://zalo.me/${soSach}`, "_blank");
    }

    router.push("/don-cua-toi-khach");
  }

  return {
    tenKhach, soDienThoai, gioHenDayDu, diaChiHen, ghiChu,
    setTenKhach, setSoDienThoai, setGioHenDayDu, setDiaChiHen, setGhiChu,
    batDau, huy, xacNhan, goiNgay,
  };
}