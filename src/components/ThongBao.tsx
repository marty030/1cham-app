"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

type LoaiThongBao = "thanhcong" | "loi" | "canhbao" | "thongtin";

type MucThongBao = {
  id: number;
  noiDung: string;
  loai: LoaiThongBao;
  rung: number; // tăng mỗi lần thông báo trùng nội dung lặp lại, dùng để phát lại hiệu ứng rung thay vì chồng thêm dòng mới
};

type XacNhanState = {
  noiDung: string;
  resolve: (ketQua: boolean) => void;
} | null;

type ThongBaoContextType = {
  thongBao: (noiDung: string, loai?: LoaiThongBao) => void;
  xacNhan: (noiDung: string) => Promise<boolean>;
};

const ThongBaoContext = createContext<ThongBaoContextType | null>(null);

const CAU_HINH_LOAI: Record<LoaiThongBao, { mau: string; Icon: typeof CheckCircle2 }> = {
  thanhcong: { mau: "bg-teal text-white border-teal", Icon: CheckCircle2 },
  loi: { mau: "bg-rust text-white border-rust", Icon: XCircle },
  canhbao: { mau: "bg-gold text-white border-gold", Icon: AlertTriangle },
  thongtin: { mau: "bg-ink text-white border-ink", Icon: Info },
};

export function ThongBaoProvider({ children }: { children: React.ReactNode }) {
  const [danhSach, setDanhSach] = useState<MucThongBao[]>([]);
  const danhSachRef = useRef<MucThongBao[]>([]);
  useEffect(() => {
    danhSachRef.current = danhSach;
  }, [danhSach]);

  const [xacNhanState, setXacNhanState] = useState<XacNhanState>(null);
  const dem = useRef(0);
  // Mỗi toast có 1 hẹn giờ tự đóng riêng, lưu theo id để hủy/đặt lại khi cần
  const henGioDong = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const datLaiHenDong = useCallback((id: number) => {
    const cu = henGioDong.current.get(id);
    if (cu) clearTimeout(cu);
    const moi = setTimeout(() => {
      setDanhSach((truoc) => truoc.filter((m) => m.id !== id));
      henGioDong.current.delete(id);
    }, 4000);
    henGioDong.current.set(id, moi);
  }, []);

  const thongBao = useCallback(
    (noiDung: string, loai: LoaiThongBao = "thongtin") => {
      // Nếu đang hiện đúng thông báo này rồi (cùng nội dung + cùng mức độ) thì không chồng thêm
      // dòng mới — chỉ phát lại hiệu ứng rung và gia hạn thời gian hiện, tránh bấm lặp gây rối màn hình
      const trung = danhSachRef.current.find((m) => m.noiDung === noiDung && m.loai === loai);
      if (trung) {
        setDanhSach((truoc) => truoc.map((m) => (m.id === trung.id ? { ...m, rung: m.rung + 1 } : m)));
        datLaiHenDong(trung.id);
        return;
      }

      dem.current += 1;
      const id = dem.current;
      setDanhSach((truoc) => [...truoc, { id, noiDung, loai, rung: 0 }]);
      datLaiHenDong(id);
    },
    [datLaiHenDong]
  );

  const dong = useCallback((id: number) => {
    const cu = henGioDong.current.get(id);
    if (cu) clearTimeout(cu);
    henGioDong.current.delete(id);
    setDanhSach((truoc) => truoc.filter((m) => m.id !== id));
  }, []);

  const xacNhan = useCallback((noiDung: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setXacNhanState({ noiDung, resolve });
    });
  }, []);

  function xuLyXacNhan(ketQua: boolean) {
    xacNhanState?.resolve(ketQua);
    setXacNhanState(null);
  }

  return (
    <ThongBaoContext.Provider value={{ thongBao, xacNhan }}>
      {children}

      {/* Toast stack */}
      <div className="fixed top-4 inset-x-0 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none">
        {danhSach.map((m) => {
          const { mau, Icon } = CAU_HINH_LOAI[m.loai];
          return (
            <div
              key={`${m.id}-${m.rung}`}
              className={`pointer-events-auto w-full max-w-sm shadow-lg rounded-xl border px-4 py-3 flex items-start gap-2.5 ${
                m.rung === 0 ? "animate-[toast-in_0.2s_ease-out]" : "animate-[toast-rung_0.3s_ease-in-out]"
              } ${mau}`}
            >
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium flex-1">{m.noiDung}</p>
              <button onClick={() => dong(m.id)} className="shrink-0 opacity-80 hover:opacity-100 p-2 -m-2">
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Hộp thoại xác nhận */}
      {xacNhanState && (
        <div className="fixed inset-0 z-[110] bg-ink/40 flex items-center justify-center px-4">
          <div className="bg-card border border-line rounded-2xl shadow-lg p-6 w-full max-w-sm">
            <p className="text-ink font-medium mb-5">{xacNhanState.noiDung}</p>
            <div className="flex gap-2">
              <button
                onClick={() => xuLyXacNhan(false)}
                className="flex-1 bg-line hover:bg-ink-soft hover:text-white text-ink-soft py-2.5 rounded-lg text-sm font-semibold transition"
              >
                Hủy
              </button>
              <button
                onClick={() => xuLyXacNhan(true)}
                className="flex-1 bg-rust hover:opacity-90 text-white py-2.5 rounded-lg text-sm font-semibold transition"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes toast-in {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes toast-rung {
          0%,
          100% {
            transform: translateX(0);
          }
          20% {
            transform: translateX(-6px);
          }
          40% {
            transform: translateX(6px);
          }
          60% {
            transform: translateX(-4px);
          }
          80% {
            transform: translateX(4px);
          }
        }
      `}</style>
    </ThongBaoContext.Provider>
  );
}

export function useThongBao() {
  const ctx = useContext(ThongBaoContext);
  if (!ctx) throw new Error("useThongBao phải được dùng bên trong ThongBaoProvider");
  return ctx.thongBao;
}

export function useXacNhan() {
  const ctx = useContext(ThongBaoContext);
  if (!ctx) throw new Error("useXacNhan phải được dùng bên trong ThongBaoProvider");
  return ctx.xacNhan;
}