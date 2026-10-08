"use client";
import { useEffect, useState } from "react";
import { Flag, Hourglass } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useThongBao } from "./ThongBao";
import { dichLoiSupabase } from "../lib/dichLoi";
import { conTrongHanBaoVanDe, NGAY_BAO_VAN_DE_SAU_HOAN_THANH } from "../lib/gioHen";

type NutBaoVanDeProps = {
  don: { id: number; trang_thai: string; hoan_thanh_luc?: string | null };
  // Báo cho trang cha biết đơn có báo cáo đang mở hay không (để khóa nút hoàn thành).
  onDoiCoBaoCao?: (coBaoCao: boolean) => void;
};

// Nút "Báo vấn đề" cho thợ và khách: chỉ hiện với đơn Đã xác nhận, hoặc Đã hoàn thành
// trong vòng 7 ngày. Báo cáo gửi cho admin; khi còn báo cáo chưa xử lý, database khóa
// việc xác nhận hoàn thành của đơn đó.
export default function NutBaoVanDe({ don, onDoiCoBaoCao }: NutBaoVanDeProps) {
  const thongBao = useThongBao();
  const [coBaoCao, setCoBaoCao] = useState(false);
  const [dangMo, setDangMo] = useState(false);
  const [noiDung, setNoiDung] = useState("");
  const [dangGui, setDangGui] = useState(false);
  const hopLe = conTrongHanBaoVanDe(don);

  useEffect(() => {
    if (!hopLe) return;
    let daHuy = false;
    supabase.rpc("don_co_bao_cao_mo", { p_don: don.id }).then(({ data, error }) => {
      if (daHuy || error) return;
      setCoBaoCao(data === true);
      onDoiCoBaoCao?.(data === true);
    });
    return () => {
      daHuy = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [don.id, don.trang_thai]);

  async function gui() {
    const noiDungSach = noiDung.trim();
    if (noiDungSach.length < 5) {
      thongBao("Hãy mô tả vấn đề ít nhất 5 ký tự.", "canhbao");
      return;
    }
    setDangGui(true);
    const { error } = await supabase
      .from("bao_cao_van_de")
      .insert({ don_id: don.id, noi_dung: noiDungSach });
    setDangGui(false);

    if (error) {
      thongBao("Lỗi: " + dichLoiSupabase(error.message), "loi");
      return;
    }
    setCoBaoCao(true);
    onDoiCoBaoCao?.(true);
    setDangMo(false);
    setNoiDung("");
    thongBao("Đã gửi báo cáo cho admin. Admin sẽ xem xét sớm.", "thanhcong");
  }

  if (!hopLe) return null;

  if (coBaoCao) {
    return (
      <div className="flex items-start gap-2.5 bg-rust-soft p-2.5 rounded-lg border border-rust/20">
        <Hourglass className="w-4 h-4 text-rust mt-0.5 shrink-0" />
        <span className="text-xs text-rust font-medium">
          Đơn đang có báo cáo vấn đề chờ admin xử lý. Việc xác nhận hoàn thành tạm khóa đến khi admin xử lý xong.
        </span>
      </div>
    );
  }

  if (!dangMo) {
    return (
      <button
        onClick={() => setDangMo(true)}
        className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-ink-soft border border-line hover:bg-gold-soft hover:text-gold hover:border-gold/30 py-2 rounded-lg transition"
      >
        <Flag className="w-3.5 h-3.5" /> Báo vấn đề với đơn này
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 bg-paper border border-line rounded-lg p-3">
      <p className="text-xs font-semibold text-ink">Mô tả vấn đề gặp phải</p>
      <textarea
        value={noiDung}
        onChange={(e) => setNoiDung(e.target.value)}
        maxLength={1000}
        rows={3}
        placeholder="Ví dụ: thợ không đến đúng hẹn / khách không có mặt / chưa thanh toán..."
        className="w-full border border-line rounded-lg p-2 text-sm outline-none focus:border-teal bg-card"
      />
      <p className="text-[11px] text-ink-soft">
        Báo cáo gửi cho admin. Trong lúc chờ xử lý, đơn này không thể xác nhận hoàn thành.
        {don.trang_thai === "Đã hoàn thành" &&
          ` Chỉ báo được trong ${NGAY_BAO_VAN_DE_SAU_HOAN_THANH} ngày sau khi đơn hoàn thành.`}
      </p>
      <div className="flex gap-2">
        <button
          onClick={gui}
          disabled={dangGui}
          className="flex-1 bg-rust hover:opacity-90 text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition"
        >
          {dangGui ? "Đang gửi..." : "Gửi báo cáo"}
        </button>
        <button
          onClick={() => setDangMo(false)}
          className="bg-line hover:bg-ink-soft hover:text-white text-ink-soft px-3 py-2 rounded-lg text-sm transition"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}