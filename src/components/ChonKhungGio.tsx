"use client";
import { useEffect, useRef, useState } from "react";
import flatpickr from "flatpickr";
import { Vietnamese } from "flatpickr/dist/l10n/vn.js";
import "flatpickr/dist/flatpickr.min.css";
import { supabase } from "../lib/supabase";
import { taoISOTuVN, gioPhutVN } from "../lib/thoiGianVN";
import { chongVoiDonDaXacNhan } from "../lib/lichLamViec";

const GIO_BAT_DAU = 7; // 07:00
const GIO_KET_THUC = 20; // 20:00 (không bao gồm khung 20:00, dừng ở 19:30)
const BUOC_PHUT = 30;

function taoDanhSachKhungGio(): string[] {
  const ds: string[] = [];
  for (let phut = GIO_BAT_DAU * 60; phut < GIO_KET_THUC * 60; phut += BUOC_PHUT) {
    const h = Math.floor(phut / 60);
    const m = phut % 60;
    ds.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
  return ds;
}

const DANH_SACH_KHUNG_GIO = taoDanhSachKhungGio();

function lamTronXuong30Phut(gio: number, phut: number): string {
  const tongPhut = gio * 60 + phut;
  const phutTron = Math.floor(tongPhut / BUOC_PHUT) * BUOC_PHUT;
  const h = Math.floor(phutTron / 60);
  const m = phutTron % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

type ChonKhungGioProps = {
  thoId: number | string | undefined | null;
  value: string; // ISO có ghi rõ +07:00, ví dụ "2026-09-07T15:30:00+07:00"; rỗng nếu chưa chọn
  onChange: (giaTri: string) => void;
  boQuaDonId?: number; // không còn tác dụng: đơn đang chờ không khóa giờ nên đơn của chính thợ chưa bao giờ nằm trong danh sách; giữ lại để các nơi gọi cũ không phải đổi
};

function tachNgayGioVN(gioTri: string): { ngay: string; gio: string } {
  if (!gioTri) return { ngay: "", gio: "" };
  const d = new Date(gioTri);
  if (isNaN(d.getTime())) {
    // Phòng hờ giá trị cũ kiểu naive "YYYY-MM-DDTHH:mm" (trước khi có fix múi giờ)
    const [ngay, gio] = gioTri.split("T");
    return { ngay: ngay || "", gio: (gio || "").slice(0, 5) };
  }
  const ngay = d.toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
  const { gio, phut } = gioPhutVN(d);
  return { ngay, gio: `${String(gio).padStart(2, "0")}:${String(phut).padStart(2, "0")}` };
}

export default function ChonKhungGio({ thoId, value, onChange }: ChonKhungGioProps) {
  const ngayInputRef = useRef<HTMLInputElement>(null);
  const fpRef = useRef<any>(null);

  const gtKhoiTao = tachNgayGioVN(value);
  const [ngayDaChon, setNgayDaChon] = useState<string>(gtKhoiTao.ngay);
  const [gioDaChon, setGioDaChon] = useState<string>(gtKhoiTao.gio);
  const [dangTaiKhungGio, setDangTaiKhungGio] = useState(false);
  // Các đơn đã xác nhận / đã hoàn thành của thợ trong ngày đang chọn (chỉ có giờ hẹn và trạng thái).
  const [donTrongNgay, setDonTrongNgay] = useState<{ gio: Date; daXacNhan: boolean }[]>([]);

  useEffect(() => {
    if (!ngayInputRef.current) return;

    fpRef.current = flatpickr(ngayInputRef.current, {
      dateFormat: "Y-m-d",
      altInput: true,
      altFormat: "d/m/Y",
      altInputClass:
        "w-full px-4 py-2.5 rounded-lg border border-line focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none transition-all cursor-pointer bg-card text-ink",
      locale: Vietnamese,
      minDate: "today",
      onChange: (_ngay: Date[], gioTriChuoi: string) => {
        setNgayDaChon(gioTriChuoi);
        setGioDaChon("");
      },
    });

    return () => {
      fpRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tải các đơn đã được thợ xác nhận (hoặc đã hoàn thành) trong ngày đã chọn.
  // Đơn còn "Chờ xác nhận" KHÔNG khóa khung giờ — chỉ khi thợ xác nhận thì giờ đó mới bị gạch.
  // Đơn đã xác nhận chiếm cả thời lượng của nó (xem lib/lichLamViec.ts), nên các khung giờ chồng lên cũng bị gạch.
  useEffect(() => {
    if (!ngayDaChon || !thoId) {
      setDonTrongNgay([]);
      return;
    }

    async function taiDonTrongNgay() {
      setDangTaiKhungGio(true);
      const batDauNgay = `${ngayDaChon}T00:00:00+07:00`;
      const ketThucNgay = `${ngayDaChon}T23:59:59+07:00`;

      // Gọi hàm SQL khung_gio_ban: chỉ trả giờ của các đơn đã xác nhận/hoàn thành,
      // không trả thông tin khách (vì bảng don_dat_lich không còn đọc công khai).
      const { data, error } = await supabase.rpc("khung_gio_ban", {
        p_tho_id: thoId,
        p_tu: batDauNgay,
        p_den: ketThucNgay,
      });

      if (error) {
        console.error("Lỗi tải khung giờ đã đặt:", error);
        setDonTrongNgay([]);
      } else {
        setDonTrongNgay(
          ((data as any[]) || []).map((don: any) => ({
            gio: new Date(don.gio_hen),
            daXacNhan: don.trang_thai === "Đã xác nhận",
          }))
        );
      }
      setDangTaiKhungGio(false);
    }

    taiDonTrongNgay();
  }, [ngayDaChon, thoId]);

  function chonKhungGio(gio: string) {
    setGioDaChon(gio);
    onChange(taoISOTuVN(ngayDaChon, gio));
  }

  const bayGioVN = gioPhutVN(new Date());
  const homNay = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
  const gioPhutHienTai = bayGioVN.gio * 60 + bayGioVN.phut;

  return (
    <div className="flex flex-col gap-3">
      <input ref={ngayInputRef} type="text" readOnly className="hidden" />

      {ngayDaChon && (
        <div>
          {dangTaiKhungGio ? (
            <p className="text-sm text-ink-soft">Đang kiểm tra khung giờ trống...</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {DANH_SACH_KHUNG_GIO.map((gio) => {
                const [h, m] = gio.split(":").map(Number);
                const daQuaGio = ngayDaChon === homNay && h * 60 + m <= gioPhutHienTai;
                const batDauKhung = new Date(taoISOTuVN(ngayDaChon, gio));
                const daDuocDat = donTrongNgay.some((don) => {
                  if (don.daXacNhan) return chongVoiDonDaXacNhan(batDauKhung, don.gio);
                  // Đơn đã hoàn thành: chỉ gạch đúng khung giờ của nó như trước đây
                  const { gio: gioDon, phut: phutDon } = gioPhutVN(don.gio);
                  return lamTronXuong30Phut(gioDon, phutDon) === gio;
                });
                const khongKhaDung = daQuaGio || daDuocDat;
                const dangChon = gioDaChon === gio;

                return (
                  <button
                    key={gio}
                    type="button"
                    disabled={khongKhaDung}
                    onClick={() => chonKhungGio(gio)}
                    className={`text-sm font-semibold py-2 rounded-lg border transition ${
                      dangChon
                        ? "bg-rust text-white border-rust"
                        : khongKhaDung
                        ? "bg-line text-ink-soft/50 border-line cursor-not-allowed line-through"
                        : "bg-card text-ink border-line hover:border-teal hover:bg-teal-soft"
                    }`}
                  >
                    {gio}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}