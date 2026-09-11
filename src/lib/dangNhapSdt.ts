import { supabase } from "./supabase";

export function chuanHoaSdt(soDienThoai: string): string {
  return soDienThoai.replace(/\D/g, "");
}

/**
 * Sinh một email nội bộ (không dùng để nhận thư) khi người dùng không nhập
 * email thật lúc đăng ký — Supabase Auth bắt buộc phải có email hoặc SDT đã
 * xác minh OTP để tạo tài khoản, và ở đây ta chưa làm OTP thật, nên dùng
 * email giả này để thỏa yêu cầu của Supabase mà không bắt người dùng phải
 * nhập email thật.
 */
export function taoEmailNoiBo(soDienThoai: string): string {
  return `sdt${chuanHoaSdt(soDienThoai)}@nguoidung.1cham.local`;
}

/**
 * Tìm email đăng nhập (email thật người dùng nhập, hoặc email nội bộ tự
 * sinh) gắn với một số điện thoại — tra theo thứ tự bảng khach rồi đến bảng
 * tho. Dùng để người dùng đăng nhập bằng số điện thoại thay vì phải nhớ
 * email đã dùng lúc đăng ký.
 */
export async function timEmailTheoSoDienThoai(soDienThoai: string): Promise<string | null> {
  const soSach = chuanHoaSdt(soDienThoai);
  if (!soSach) return null;

  const { data: khachData } = await supabase
    .from("khach")
    .select("email_dang_nhap")
    .eq("so_dien_thoai", soSach)
    .maybeSingle();
  if (khachData?.email_dang_nhap) return khachData.email_dang_nhap;

  const { data: thoData } = await supabase
    .from("tho")
    .select("email_dang_nhap")
    .eq("so_dien_thoai", soSach)
    .maybeSingle();
  if (thoData?.email_dang_nhap) return thoData.email_dang_nhap;

  return null;
}

/**
 * Kiểm tra một số điện thoại đã có tài khoản (khách hoặc thợ) hay chưa —
 * dùng để chặn đăng ký trùng, tránh việc tra email-theo-SDT bị mơ hồ sau này.
 */
export async function daCoTaiKhoanTheoSdt(soDienThoai: string): Promise<boolean> {
  const soSach = chuanHoaSdt(soDienThoai);
  if (!soSach) return false;

  const { data: khachData } = await supabase
    .from("khach")
    .select("id")
    .eq("so_dien_thoai", soSach)
    .maybeSingle();
  if (khachData) return true;

  const { data: thoData } = await supabase
    .from("tho")
    .select("id")
    .eq("so_dien_thoai", soSach)
    .maybeSingle();
  return !!thoData;
}