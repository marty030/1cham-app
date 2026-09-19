"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { layHoSoKhachHienTai } from "../../lib/khach";
import { TUY_CHON_GIO_VN } from "../../lib/thoiGianVN";
import { ArrowLeft, MessageCircle } from "lucide-react";

type HoiThoai = {
  tho_id: number;
  ten_tho: string;
  tin_nhan_cuoi: string;
  thoi_gian_cuoi: string;
};

export default function TinNhanCuaToiKhach() {
  const router = useRouter();
  const [khachId, setKhachId] = useState<number | null>(null);
  const [danhSachHoiThoai, setDanhSachHoiThoai] = useState<HoiThoai[]>([]);
  const [dangTai, setDangTai] = useState(true);

  const taiDanhSachHoiThoai = async (idKhach: number) => {
    const { data, error } = await supabase
      .from("tin_nhan")
      .select("tho_id, noi_dung, created_at, tho(ten)")
      .eq("khach_id", idKhach)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Lỗi tải danh sách hội thoại:", error.message);
      return;
    }

    const daThay = new Set<number>();
    const ketQua: HoiThoai[] = [];
    for (const dong of data as any[]) {
      if (!dong.tho_id || daThay.has(dong.tho_id)) continue;
      daThay.add(dong.tho_id);
      ketQua.push({
        tho_id: dong.tho_id,
        ten_tho: dong.tho?.ten ?? "Thợ #" + dong.tho_id,
        tin_nhan_cuoi: dong.noi_dung,
        thoi_gian_cuoi: dong.created_at,
      });
    }
    setDanhSachHoiThoai(ketQua);
  };

  useEffect(() => {
    async function khoiTao() {
      const hoSo = await layHoSoKhachHienTai();
      if (!hoSo) {
        router.push("/login?next=/tin-nhan-cua-toi");
        return;
      }
      setKhachId(hoSo.id);
      await taiDanhSachHoiThoai(hoSo.id);
      setDangTai(false);
    }
    khoiTao();
  }, [router]);

  // Cập nhật danh sách ngay khi có tin nhắn mới (từ thợ hoặc do chính mình vừa gửi ở tab khác)
  useEffect(() => {
    if (!khachId) return;

    const channel = supabase
      .channel(`tin-nhan-cua-toi-${khachId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tin_nhan", filter: `khach_id=eq.${khachId}` },
        () => {
          taiDanhSachHoiThoai(khachId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [khachId]);

  if (dangTai) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/tho-gan-ban" className="text-sm text-rust hover:underline font-medium flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-6 flex items-center gap-2">
          <MessageCircle className="w-6 h-6" /> Tin nhắn của tôi
        </h1>

        {danhSachHoiThoai.length === 0 ? (
          <div className="bg-card p-12 rounded-2xl shadow-sm text-center border border-line">
            <p className="text-ink-soft text-lg">Bạn chưa nhắn tin với thợ nào.</p>
            <Link href="/tho-gan-ban" className="inline-block mt-4 text-rust font-semibold hover:underline">
              Tìm thợ và nhắn tin ngay →
            </Link>
          </div>
        ) : (
          <div className="bg-card rounded-2xl shadow-sm border border-line divide-y divide-line overflow-hidden">
            {danhSachHoiThoai.map((ht) => (
              <Link
                key={ht.tho_id}
                href={`/chat/${ht.tho_id}`}
                className="flex flex-col gap-1 p-4 hover:bg-paper transition"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-ink">{ht.ten_tho}</span>
                  <span className="text-xs text-ink-soft shrink-0">
                    {new Date(ht.thoi_gian_cuoi).toLocaleString("vi-VN", TUY_CHON_GIO_VN)}
                  </span>
                </div>
                <span className="text-sm text-ink-soft line-clamp-1">{ht.tin_nhan_cuoi}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}