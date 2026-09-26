"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { useVungNhinThayThuc } from "../../../lib/chieuCaoManHinh";
import { MessageCircle, Send, ArrowLeft } from "lucide-react";
import { useThongBao } from "../../../components/ThongBao";

type TinNhan = {
  id: number;
  created_at: string;
  tho_id: number;
  khach_id: number;
  sender_type: string;
  noi_dung: string;
};

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const thoId = params.id as string;

  const [khachId, setKhachId] = useState<number | null>(null);
  const [tenTho, setTenTho] = useState<string>("");
  const [dangKiemTra, setDangKiemTra] = useState(true);
  const [danhSachTinNhan, setDanhSachTinNhan] = useState<TinNhan[]>([]);
  const [noiDungMoi, setNoiDungMoi] = useState("");
  const cuoiDanhSachRef = useRef<HTMLDivElement>(null);
  const vungNhinThay = useVungNhinThayThuc();
  const thongBao = useThongBao();

  // Khoá cuộn trang nền lại — chỉ khung tin nhắn bên trong được cuộn,
  // tránh trang bị trôi/lệch khi bàn phím ảo bật lên.
  useEffect(() => {
    const cu = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = cu;
    };
  }, []);

  useEffect(() => {
    async function kiemTraDangNhap() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push("/login");
        return;
      }

      const { data: hoSoKhach, error: loiKhach } = await supabase
        .from("khach")
        .select("id")
        .eq("user_id", sessionData.session.user.id)
        .single();

      if (!hoSoKhach) {
        thongBao("Chỉ tài khoản khách hàng mới được chat tại đây.", "thongtin");
        router.push("/");
        return;
      }
      setKhachId(hoSoKhach.id);
      setDangKiemTra(false);
    }
    kiemTraDangNhap();
  }, [router]);

  useEffect(() => {
    async function layTenTho() {
      if (!thoId) return;
      const { data } = await supabase.from("tho").select("ten").eq("id", thoId).single();
      if (data?.ten) setTenTho(data.ten);
    }
    layTenTho();
  }, [thoId]);

  const taiTinNhan = async () => {
    if (!thoId || !khachId) return;

    const { data, error } = await supabase
      .from("tin_nhan")
      .select("*")
      .eq("tho_id", thoId)
      .eq("khach_id", khachId)
      .order("created_at", { ascending: true });

    if (data) setDanhSachTinNhan(data);
    if (error) console.error("Lỗi tải tin nhắn:", error);
  };

  useEffect(() => {
    taiTinNhan();
  }, [thoId, khachId]);

  useEffect(() => {
    if (!thoId || !khachId) return;

    const channel = supabase
      .channel(`chat-room-${thoId}-${khachId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tin_nhan",
          filter: `tho_id=eq.${thoId}`,
        },
        (payload: { new: TinNhan }) => {
          if (payload.new && payload.new.khach_id === khachId) {
            setDanhSachTinNhan((prev) => {
              const isExist = prev.some((item) => item.id === payload.new.id);
              if (isExist) return prev;
              return [...prev, payload.new];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [thoId, khachId]);

  useEffect(() => {
    cuoiDanhSachRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [danhSachTinNhan]);

  const guiTinNhan = async () => {
    if (!noiDungMoi.trim() || !khachId) return;

    const currentText = noiDungMoi;
    setNoiDungMoi("");

    const { data, error } = await supabase
      .from("tin_nhan")
      .insert([
        {
          tho_id: parseInt(thoId),
          khach_id: khachId,
          sender_type: "khach",
          noi_dung: currentText,
        },
      ])
      .select();

    if (error) {
      console.error("Lỗi gửi tin nhắn:", error);
      setNoiDungMoi(currentText);
    } else if (data && data.length > 0) {
      setDanhSachTinNhan((prev) => [...prev, data[0]]);
    }
  };

  if (dangKiemTra) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal"></div>
      </div>
    );
  }

  return (
    <div
      className="max-w-md mx-auto border border-line flex flex-col bg-paper overflow-hidden fixed inset-x-0"
      style={{ top: vungNhinThay?.top ?? 0, height: vungNhinThay?.height ?? "100dvh" }}
    >
      <div className="p-4 bg-teal text-white font-bold flex items-center gap-3 shadow">
                <Link href="/tin-nhan-cua-toi" className="leading-none flex items-center justify-center p-2 -m-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-base flex items-center gap-2">
            <MessageCircle className="w-4 h-4" /> {tenTho ? `Trò chuyện với ${tenTho}` : "Đang tải..."}
          </h1>
          <p className="text-xs text-white/80">Đang hoạt động</p>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
        {danhSachTinNhan.length === 0 ? (
          <p className="text-center text-ink-soft text-sm mt-10">
            Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện!
          </p>
        ) : (
          danhSachTinNhan.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-xl max-w-[80%] ${
                msg.sender_type === "khach"
                  ? "bg-teal text-white self-end rounded-br-none"
                  : "bg-card text-ink self-start rounded-bl-none shadow-sm border border-line"
              }`}
            >
              <p className="text-[10px] opacity-75 mb-1 font-semibold">
                {msg.sender_type === "khach" ? "Bạn" : "Thợ"}
              </p>
              <p className="text-sm">{msg.noi_dung}</p>
            </div>
          ))
        )}
        <div ref={cuoiDanhSachRef} />
      </div>

      <div className="p-3 bg-card border-t border-line flex gap-2">
        <input
          type="text"
          value={noiDungMoi}
          onChange={(e) => setNoiDungMoi(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && guiTinNhan()}
          placeholder="Nhập tin nhắn..."
          className="flex-1 border border-line rounded-full px-4 py-2 text-base outline-none focus:border-teal text-ink"
        />
        <button
          onClick={guiTinNhan}
          className="bg-teal text-white px-5 py-2 rounded-full text-sm font-bold hover:opacity-90 transition flex items-center justify-center gap-1.5"
        >
          <Send className="w-4 h-4" />
          <span>Gửi</span>
        </button>
      </div>
    </div>
  );
}