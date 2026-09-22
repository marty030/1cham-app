"use client";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

type LoaiThongBao = "thanhcong" | "loi" | "canhbao" | "thongtin";

type MucThongBao = {
  id: number;
  noiDung: string;
  loai: LoaiThongBao;
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
  const [xacNhanState, setXacNhanState] = useState<XacNhanState>(null);
  const dem = useRef(0);

  const thongBao = useCallback((noiDung: string, loai: LoaiThongBao = "thongtin") => {
    dem.current += 1;
    const id = dem.current;
    setDanhSach((truoc) => [...truoc, { id, noiDung, loai }]);
    setTimeout(() => {
      setDanhSach((truoc) => truoc.filter((m) => m.id !== id));
    }, 4000);
  }, []);

  const dong = useCallback((id: number) => {
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
              key={m.id}
              className={`pointer-events-auto w-full max-w-sm shadow-lg rounded-xl border px-4 py-3 flex items-start gap-2.5 animate-[toast-in_0.2s_ease-out] ${mau}`}
            >
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium flex-1">{m.noiDung}</p>
              <button onClick={() => dong(m.id)} className="shrink-0 opacity-80 hover:opacity-100">
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