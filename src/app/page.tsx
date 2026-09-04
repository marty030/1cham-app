"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { DANH_MUC_NGHE } from "../lib/danhMuc";

const ICON_DANH_MUC: Record<string, string> = {
  dien_lanh: "❄️",
  dien_nuoc: "🔧",
  do_gia_dung: "🧺",
  khac: "🛠️",
};

export default function TrangChu() {
  const [daDangNhap, setDaDangNhap] = useState(false);
  const [laAdmin, setLaAdmin] = useState(false);

  useEffect(() => {
    async function kiemTraDangNhap() {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setDaDangNhap(true);
        const role = data.session.user.user_metadata?.role;
        setLaAdmin(role === "admin");
      } else {
        setDaDangNhap(false);
        setLaAdmin(false);
      }
    }
    kiemTraDangNhap();
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen bg-paper py-10 px-4 sm:px-6">
      <div className="flex flex-wrap justify-center gap-3 w-full max-w-4xl mb-10">
        {daDangNhap ? (
          <button
            className="bg-line hover:bg-ink-soft hover:text-white text-ink-soft transition px-5 py-2.5 rounded-xl shadow-sm font-medium"
            onClick={async () => {
              await supabase.auth.signOut();
              setDaDangNhap(false);
            }}
          >
            Đăng xuất
          </button>
        ) : (
          <>
            <Link href="/login">
              <button className="bg-card hover:bg-teal-soft transition text-teal border border-teal/30 px-5 py-2.5 rounded-xl shadow-sm font-medium">
                Đăng nhập
              </button>
            </Link>
            <Link href="/dang-ky">
              <button className="bg-teal hover:opacity-90 transition text-white px-5 py-2.5 rounded-xl shadow-sm font-medium">
                Đăng ký làm thợ
              </button>
            </Link>
            <Link href="/dang-ky-khach">
              <button className="bg-card hover:bg-rust-soft transition text-rust border border-rust/30 px-5 py-2.5 rounded-xl shadow-sm font-medium">
                Đăng ký làm khách hàng
              </button>
            </Link>
          </>
        )}

        {daDangNhap && (
          <>
            <Link href="/ho-so">
              <button className="bg-teal-soft hover:opacity-80 transition text-teal px-5 py-2.5 rounded-xl shadow-sm font-medium">
                Hồ sơ của tôi
              </button>
            </Link>
            <Link href="/don-cua-toi">
              <button className="bg-gold-soft hover:opacity-80 transition text-gold px-5 py-2.5 rounded-xl shadow-sm font-medium">
                Đơn của tôi
              </button>
            </Link>
          </>
        )}

        {laAdmin && (
          <Link href="/admin/don-dat-lich">
            <button className="bg-gold hover:opacity-90 transition text-white px-5 py-2.5 rounded-xl shadow-sm font-medium">
              Xem đơn đặt lịch
            </button>
          </Link>
        )}
      </div>

      <div className="text-center mb-12 max-w-xl">
        <h1 className="text-3xl md:text-4xl font-bold text-ink mb-3">
        Thợ nhanh-Chất Lượng
        </h1>
        <p className="text-ink-soft">
          Tìm thợ sửa chữa gia dụng gần bạn tại khu vực Hà Đông, Hà Nội — chọn đúng ngành bạn cần bên dưới.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl mb-8">
        {DANH_MUC_NGHE.map((muc) => (
          <Link key={muc.gia_tri} href={`/tho-gan-ban?danh_muc=${muc.gia_tri}`}>
            <div className="bg-card border border-line rounded-2xl p-5 flex flex-col items-center gap-2 text-center shadow-sm hover:shadow-md hover:border-rust/40 transition-all cursor-pointer h-full">
              <span className="text-4xl">{ICON_DANH_MUC[muc.gia_tri] ?? "🛠️"}</span>
              <span className="text-sm font-semibold text-ink">{muc.nhan}</span>
            </div>
          </Link>
        ))}
      </div>

      <Link href="/tho-gan-ban" className="text-rust hover:underline font-medium">
        Xem tất cả thợ →
      </Link>
    </div>
  );
}