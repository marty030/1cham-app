"use client";

import type { ReactNode } from "react";
import { MUC_BAT_BUOC, type VaiTro } from "../lib/dongYPhapLy";

// Liên kết mở tab mới để người dùng đọc mà không mất dữ liệu đang nhập trong form
function LienKet({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-teal font-semibold underline">
      {children}
    </a>
  );
}

const NOI_DUNG_MUC: Record<string, ReactNode> = {
  tu_18_tuoi: <>Tôi xác nhận mình đã đủ 18 tuổi.</>,
  dieu_khoan: (
    <>
      Tôi đã đọc và đồng ý với <LienKet href="/dieu-khoan">Điều khoản sử dụng</LienKet> và{" "}
      <LienKet href="/quy-che">Quy chế hoạt động</LienKet>.
    </>
  ),
  bao_mat: (
    <>
      Tôi đồng ý để Thợ Xịn thu thập và xử lý dữ liệu cá nhân của tôi (số điện thoại, tên, địa chỉ, nội dung đơn, tin nhắn...)
      theo <LienKet href="/bao-mat">Chính sách bảo vệ dữ liệu cá nhân</LienKet>.
    </>
  ),
  cong_khai_ho_so_tho: (
    <>
      Tôi hiểu và đồng ý hiển thị công khai tên, nghề, ngành, địa chỉ, vị trí và khu vực hoạt động (nếu tôi thiết lập), ảnh đại
      diện, số đơn hoàn thành và điểm đánh giá của tôi cho mọi người xem. Số điện thoại chỉ hiện cho người đã đăng nhập. Tôi biết vị
      trí là dữ liệu nhạy cảm và có thể chọn điểm không phải nhà riêng.
    </>
  ),
};

type Props = {
  vaiTro: VaiTro;
  daChon: string[];
  onDoi: (daChon: string[]) => void;
  hienLoi?: boolean;
};

// Các ô để TRỐNG mặc định (không tích sẵn): sự đồng ý phải do chính người dùng chủ động đánh dấu.
export default function KhoiDongY({ vaiTro, daChon, onDoi, hienLoi }: Props) {
  function doi(muc: string) {
    onDoi(daChon.includes(muc) ? daChon.filter((m) => m !== muc) : [...daChon, muc]);
  }

  return (
    <div
      className={`flex flex-col gap-2.5 rounded-lg border p-3 bg-paper ${
        hienLoi ? "border-rust" : "border-line"
      }`}
    >
      {MUC_BAT_BUOC[vaiTro].map((muc) => (
        <label key={muc} className="flex items-start gap-2.5 text-xs text-ink-soft leading-relaxed">
          <input
            type="checkbox"
            checked={daChon.includes(muc)}
            onChange={() => doi(muc)}
            className="w-4 h-4 mt-0.5 shrink-0 accent-teal"
          />
          <span>{NOI_DUNG_MUC[muc]}</span>
        </label>
      ))}
      {hienLoi && <p className="text-xs text-rust">Cần đánh dấu tất cả các mục trên để tiếp tục.</p>}
    </div>
  );
}