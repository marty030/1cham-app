"use client";
import { useEffect, useRef, useState } from "react";
import flatpickr from "flatpickr";
import { Vietnamese } from "flatpickr/dist/l10n/vn.js";
import "flatpickr/dist/flatpickr.min.css";
import { supabase } from "../lib/supabase";
import { taoISOTuVN, gioPhutVN } from "../lib/thoiGianVN";

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
  boQuaDonId?: number; // loại trừ chính đơn này khỏi danh sách "đã bị đặt" (dùng khi thợ xác nhận giờ cho chính đơn đó)
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

export default function ChonKhungGio({ thoId, value, onChange, boQuaDonId }: ChonKhungGioProps) {
  const ngayInputRef = useRef<HTMLInputElement>(null);
  const fpRef = useRef<any>(null);

  const gtKhoiTao = tachNgayGioVN(value);
  const [ngayDaChon, setNgayDaChon] = useState<string>(gtKhoiTao.ngay);
  const [gioDaChon, setGioDaChon] = useState<string>(gtKhoiTao.gio);
  const [dangTaiKhungGio, setDangTaiKhungGio] = useState(false);
  const [khungGioDaDat, setKhungGioDaDat] = useState<Set<string>>(new Set());

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

  // Tải các khung giờ đã có đơn khác của đúng thợ này trong ngày đã chọn
  useEffect(() => {
    if (!ngayDaChon || !thoId) {
      setKhungGioDaDat(new Set());
      return;
    }

    async function taiDonTrongNgay() {
      setDangTaiKhungGio(true);
      const batDauNgay = `${ngayDaChon}T00:00:00+07:00`;
      const ketThucNgay = `${ngayDaChon}T23:59:59+07:00`;

      let truyVan = supabase
        .from("don_dat_lich")
        .select("gio_hen")
        .eq("tho_id", thoId)
        .neq("trang_thai", "Đã hủy")
        .gte("gio_hen", batDauNgay)
        .lte("gio_hen", ketThucNgay);

      if (boQuaDonId) {
        truyVan = truyVan.neq("id", boQuaDonId);
      }

      const { data, error } = await truyVan;

      if (error) {
        console.error("Lỗi tải khung giờ đã đặt:", error);
        setKhungGioDaDat(new Set());
      } else {
        const daDat = new Set(
          (data || []).map((don: any) => {
            const { gio, phut } = gioPhutVN(don.gio_hen);
            return lamTronXuong30Phut(gio, phut);
          })
        );
        setKhungGioDaDat(daDat);
      }
      setDangTaiKhungGio(false);
    }

    taiDonTrongNgay();
  }, [ngayDaChon, thoId, boQuaDonId]);

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
                const daDuocDat = khungGioDaDat.has(gio);
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