"use client";
import Link from "next/link";
import { HoSoKhach } from "../lib/khach";
import {
  LogOut,
  LogIn,
  UserPlus,
  User,
  ClipboardList,
  Settings,
  MessageCircle,
} from "lucide-react";

type Props = {
  daDangNhap: boolean;
  laAdmin: boolean;
  hoSoKhach: HoSoKhach | null;
  onDangXuat: () => void;
  // "gon": thanh nhỏ, đẩy phải — dùng cho trang chủ (không tranh chỗ với nội dung chính).
  // "day_du": nút to, canh giữa — dùng cho trang làm việc (tho-gan-ban).
  bienThe?: "gon" | "day_du";
};

export default function ThanhDieuHuong({
  daDangNhap,
  laAdmin,
  hoSoKhach,
  onDangXuat,
  bienThe = "day_du",
}: Props) {
  if (bienThe === "gon") {
    return (
      <div className="flex flex-wrap justify-end gap-2 px-4 sm:px-6 py-3 max-w-5xl mx-auto">
        {daDangNhap ? (
          <button
            className="flex items-center gap-1.5 bg-card border border-line hover:bg-line text-ink-soft transition px-4 py-2 rounded-lg text-sm font-medium"
            onClick={onDangXuat}
          >
            <LogOut className="w-3.5 h-3.5" /> Đăng xuất
          </button>
        ) : (
          <>
            <Link href="/login">
              <button className="flex items-center gap-1.5 bg-card hover:bg-teal-soft transition text-teal border border-teal/30 px-4 py-2 rounded-lg text-sm font-medium">
                <LogIn className="w-3.5 h-3.5" /> Đăng nhập
              </button>
            </Link>
            <Link href="/dang-ky-khach">
              <button className="flex items-center gap-1.5 bg-card hover:bg-rust-soft transition text-rust border border-rust/30 px-4 py-2 rounded-lg text-sm font-medium">
                <UserPlus className="w-3.5 h-3.5" /> Đăng ký khách hàng
              </button>
            </Link>
            <Link href="/dang-ky">
              <button className="flex items-center gap-1.5 bg-teal hover:opacity-90 transition text-white px-4 py-2 rounded-lg text-sm font-medium">
                <UserPlus className="w-3.5 h-3.5" /> Đăng ký làm thợ
              </button>
            </Link>
          </>
        )}

        {daDangNhap && (
          <>
            {!hoSoKhach && (
              <Link href="/ho-so">
                <button className="flex items-center gap-1.5 bg-teal-soft hover:opacity-80 transition text-teal px-4 py-2 rounded-lg text-sm font-medium">
                  <User className="w-3.5 h-3.5" /> Hồ sơ của tôi
                </button>
              </Link>
            )}
            <Link href={hoSoKhach ? "/don-cua-toi-khach" : "/don-cua-toi"}>
              <button className="flex items-center gap-1.5 bg-gold-soft hover:opacity-80 transition text-gold px-4 py-2 rounded-lg text-sm font-medium">
                <ClipboardList className="w-3.5 h-3.5" /> Đơn của tôi
              </button>
            </Link>
            {hoSoKhach && (
              <Link href="/tin-nhan-cua-toi">
                <button className="flex items-center gap-1.5 bg-teal-soft hover:opacity-80 transition text-teal px-4 py-2 rounded-lg text-sm font-medium">
                  <MessageCircle className="w-3.5 h-3.5" /> Tin nhắn
                </button>
              </Link>
            )}
          </>
        )}

        {laAdmin && (
          <Link href="/admin/don-dat-lich">
            <button className="flex items-center gap-1.5 bg-gold hover:opacity-90 transition text-white px-4 py-2 rounded-lg text-sm font-medium">
              <Settings className="w-3.5 h-3.5" /> Xem đơn đặt lịch
            </button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-3 w-full max-w-4xl mb-10">
      {daDangNhap ? (
        <button
          className="flex items-center gap-2 bg-line hover:bg-ink-soft hover:text-white text-ink-soft transition px-5 py-2.5 rounded-xl shadow-sm font-medium"
          onClick={onDangXuat}
        >
          <LogOut className="w-4 h-4" /> Đăng xuất
        </button>
      ) : (
        <>
          <Link href="/login">
            <button className="flex items-center gap-2 bg-card hover:bg-teal-soft transition text-teal border border-teal/30 px-5 py-2.5 rounded-xl shadow-sm font-medium">
              <LogIn className="w-4 h-4" /> Đăng nhập
            </button>
          </Link>
          <Link href="/dang-ky">
            <button className="flex items-center gap-2 bg-teal hover:opacity-90 transition text-white px-5 py-2.5 rounded-xl shadow-sm font-medium">
              <UserPlus className="w-4 h-4" /> Đăng ký làm thợ
            </button>
          </Link>
          <Link href="/dang-ky-khach">
            <button className="flex items-center gap-2 bg-card hover:bg-rust-soft transition text-rust border border-rust/30 px-5 py-2.5 rounded-xl shadow-sm font-medium">
              <UserPlus className="w-4 h-4" /> Đăng ký làm khách hàng
            </button>
          </Link>
        </>
      )}

      {daDangNhap && (
        <>
          {!hoSoKhach && (
            <Link href="/ho-so">
              <button className="flex items-center gap-2 bg-teal-soft hover:opacity-80 transition text-teal px-5 py-2.5 rounded-xl shadow-sm font-medium">
                <User className="w-4 h-4" /> Hồ sơ của tôi
              </button>
            </Link>
          )}
          <Link href={hoSoKhach ? "/don-cua-toi-khach" : "/don-cua-toi"}>
            <button className="flex items-center gap-2 bg-gold-soft hover:opacity-80 transition text-gold px-5 py-2.5 rounded-xl shadow-sm font-medium">
              <ClipboardList className="w-4 h-4" /> Đơn của tôi
            </button>
          </Link>
          {hoSoKhach && (
            <Link href="/tin-nhan-cua-toi">
              <button className="flex items-center gap-2 bg-teal-soft hover:opacity-80 transition text-teal px-5 py-2.5 rounded-xl shadow-sm font-medium">
                <MessageCircle className="w-4 h-4" /> Tin nhắn
              </button>
            </Link>
          )}
        </>
      )}

      {laAdmin && (
        <Link href="/admin/don-dat-lich">
          <button className="flex items-center gap-2 bg-gold hover:opacity-90 transition text-white px-5 py-2.5 rounded-xl shadow-sm font-medium">
            <Settings className="w-4 h-4" /> Xem đơn đặt lịch
          </button>
        </Link>
      )}
    </div>
  );
}