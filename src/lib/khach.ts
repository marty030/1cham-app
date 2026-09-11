import { supabase } from "./supabase";

export type HoSoKhach = {
  id: number;
  ten: string;
  so_dien_thoai: string;
  user_id: string;
};

/**
 * Trả về hồ sơ khách hàng của người đang đăng nhập, hoặc null nếu chưa đăng
 * nhập hoặc tài khoản đang đăng nhập không phải tài khoản khách hàng (ví dụ
 * đang đăng nhập bằng tài khoản thợ).
 */
export async function layHoSoKhachHienTai(): Promise<HoSoKhach | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return null;

  const { data, error } = await supabase
    .from("khach")
    .select("id, ten, so_dien_thoai, user_id")
    .eq("user_id", sessionData.session.user.id)
    .single();

  if (error || !data) return null;
  return data as HoSoKhach;
}