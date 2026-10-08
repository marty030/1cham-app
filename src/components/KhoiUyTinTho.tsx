"use client";
import Link from "next/link";
import { Star, ExternalLink } from "lucide-react";
import { tinhCapDo, tinhHuyHieu } from "../lib/hoSoUyTin";

type Props = {
  thoId: number | string;
  soDonHoanThanh: number | null;
  saoTrungBinh: number | null;
  soDanhMuc: number;
};

// Khối "Hồ sơ uy tín của tôi" cho thợ: cùng số liệu, cùng cách tính với trang khách thấy ở /tho/[id].
export default function KhoiUyTinTho({ thoId, soDonHoanThanh, saoTrungBinh, soDanhMuc }: Props) {
  const soDon = soDonHoanThanh || 0;
  const sao = saoTrungBinh || 0;
  const { hienTai, ke, phanTram } = tinhCapDo(soDon);
  const huyHieu = tinhHuyHieu(soDon, sao, soDanhMuc);

  return (
    <div className="bg-card border border-line rounded-2xl p-5 mb-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-ink-soft uppercase tracking-wide font-mono">Cấp độ của bạn</p>
          <p className="text-lg font-bold text-gold">{hienTai.ten}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-ink-soft uppercase tracking-wide font-mono">Điểm đánh giá</p>
          <p className="text-lg font-bold text-gold font-mono">
            {soDon > 0 ? (
              <span className="flex items-center justify-end gap-1">
                <Star className="w-4 h-4 fill-gold text-gold" /> {sao}
              </span>
            ) : (
              "Chưa có"
            )}
          </p>
        </div>
      </div>

      <div>
        <div className="h-2.5 bg-line rounded-full overflow-hidden">
          <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${phanTram}%` }} />
        </div>
        <p className="text-xs text-ink-soft mt-1.5 font-mono">
          {ke
            ? `${soDon}/${ke.nguong} đơn để lên "${ke.ten}"`
            : `${soDon} đơn hoàn thành — cấp độ cao nhất`}
        </p>
      </div>

      {huyHieu.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-line">
          {huyHieu.map((hh) => (
            <span
              key={hh.ten}
              className="bg-gold-soft text-gold text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5"
            >
              <span>{hh.icon}</span> {hh.ten}
            </span>
          ))}
        </div>
      )}

      <Link
        href={`/tho/${thoId}`}
        className="self-start text-sm text-rust hover:underline font-medium inline-flex items-center gap-1"
      >
        Xem trang khách thấy <ExternalLink className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}