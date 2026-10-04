"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { layHoSoKhachHienTai, HoSoKhach } from "../lib/khach";

// Kiểm tra trạng thái đăng nhập hiện tại (khách/thợ/admin) — dùng chung cho
// mọi trang cần biết ai đang đăng nhập, thay vì mỗi trang tự gọi lại
// supabase.auth.getSession() + layHoSoKhachHienTai() một cách rời rạc.
export function useTaiKhoanHienTai() {
  const [daDangNhap, setDaDangNhap] = useState(false);
  const [laAdmin, setLaAdmin] = useState(false);
  const [hoSoKhach, setHoSoKhach] = useState<HoSoKhach | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function kiemTraDangNhap() {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setDaDangNhap(true);
        setCurrentUserId(data.session.user.id);
        // Vai trò admin đọc từ app_metadata (chỉ sửa được từ phía server/SQL), KHÔNG dùng
        // user_metadata vì người dùng tự sửa được trường đó từ trình duyệt.
        const role = data.session.user.app_metadata?.role;
        setLaAdmin(role === "admin");
        setHoSoKhach(await layHoSoKhachHienTai());
      } else {
        setDaDangNhap(false);
        setLaAdmin(false);
        setCurrentUserId(null);
        setHoSoKhach(null);
      }
    }
    kiemTraDangNhap();
  }, []);

  async function dangXuat() {
    await supabase.auth.signOut();
    setDaDangNhap(false);
    setLaAdmin(false);
    setCurrentUserId(null);
    setHoSoKhach(null);
  }

  return { daDangNhap, laAdmin, hoSoKhach, currentUserId, dangXuat };
}