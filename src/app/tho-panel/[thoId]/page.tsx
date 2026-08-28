"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type TinNhan = {
  id: number;
  created_at: string;
  tho_id: number;
  khach_id: number;
  sender_type: string;
  noi_dung: string;
};

type HoiThoai = {
  khach_id: number;
  ten_khach: string;
  so_dien_thoai: string;
  tin_nhan_cuoi: string;
  thoi_gian_cuoi: string;
  coDonXacNhan: boolean; // MỚI: chỉ true khi đã có đơn xác nhận với đúng SĐT này
};

export default function TrangLamViecTho() {
  const params = useParams();
  const thoId = params.thoId as string;

  const [danhSachHoiThoai, setDanhSachHoiThoai] = useState<HoiThoai[]>([]);
  const [khachDangChon, setKhachDangChon] = useState<HoiThoai | null>(null);
  const [danhSachTinNhan, setDanhSachTinNhan] = useState<TinNhan[]>([]);
  const [noiDungMoi, setNoiDungMoi] = useState("");

  const [dangChiaSeViTri, setDangChiaSeViTri] = useState(false);
  const lanCapNhatCuoi = useRef<number>(0);

  useEffect(() => {
    if (!thoId) return;
    if (!("geolocation" in navigator)) return;

    const capNhatViTri = async (lat: number, lng: number) => {
      const bayGio = Date.now();
      if (bayGio - lanCapNhatCuoi.current < 30000) return;
      lanCapNhatCuoi.current = bayGio;

      const { error } = await supabase
        .from("tho")
        .update({ vi_do: lat, kinh_do: lng })
        .eq("id", thoId);

      if (error) console.error("Lỗi cập nhật vị trí:", error.message);
    };

    const watchId = navigator.geolocation.watchPosition(
      (viTri) => {
        setDangChiaSeViTri(true);
        capNhatViTri(viTri.coords.latitude, viTri.coords.longitude);
      },
      (loi) => {
        console.error("Lỗi định vị — code:", loi.code, "| message:", loi.message);
        setDangChiaSeViTri(false);
      },
      { enableHighAccuracy: false, maximumAge: 15000, timeout: 20000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setDangChiaSeViTri(false);
    };
  }, [thoId]);

  // 1. Tải danh sách hội thoại + kiểm tra đơn xác nhận cho mỗi khách
  const taiDanhSachHoiThoai = async () => {
    if (!thoId) return;

    const { data, error } = await supabase
      .from("tin_nhan")
      .select("khach_id, noi_dung, created_at, khach(ten, so_dien_thoai)")
      .eq("tho_id", thoId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Lỗi tải danh sách hội thoại:", error.message);
      return;
    }

    // Lấy các đơn ĐÃ XÁC NHẬN của thợ này, gom SĐT đã xác nhận vào 1 Set để so khớp nhanh
    const { data: donXacNhan } = await supabase
      .from("don_dat_lich")
      .select("so_dien_thoai")
      .eq("tho_id", thoId)
      .eq("trang_thai", "Đã xác nhận");

    const boSoDaXacNhan = new Set((donXacNhan || []).map((d) => d.so_dien_thoai));

    const daThay = new Set<number>();
    const ketQua: HoiThoai[] = [];
    for (const dong of data as any[]) {
      if (!dong.khach_id || daThay.has(dong.khach_id)) continue;
      daThay.add(dong.khach_id);
      const soDienThoaiKhach = dong.khach?.so_dien_thoai ?? "";
      ketQua.push({
        khach_id: dong.khach_id,
        ten_khach: dong.khach?.ten ?? "Khách #" + dong.khach_id,
        so_dien_thoai: soDienThoaiKhach,
        tin_nhan_cuoi: dong.noi_dung,
        thoi_gian_cuoi: dong.created_at,
        coDonXacNhan: boSoDaXacNhan.has(soDienThoaiKhach),
      });
    }
    setDanhSachHoiThoai(ketQua);
  };

  useEffect(() => {
    taiDanhSachHoiThoai();
  }, [thoId]);

  const taiTinNhanCuaKhach = async (khachId: number) => {
    const { data, error } = await supabase
      .from("tin_nhan")
      .select("*")
      .eq("tho_id", thoId)
      .eq("khach_id", khachId)
      .order("created_at", { ascending: true });

    if (data) setDanhSachTinNhan(data);
    if (error) console.error("Lỗi tải tin nhắn:", error.message);
  };

  function chonHoiThoai(hoiThoai: HoiThoai) {
    setKhachDangChon(hoiThoai);
    taiTinNhanCuaKhach(hoiThoai.khach_id);
  }

  useEffect(() => {
    if (!thoId) return;

    const channel = supabase
      .channel(`tho-panel-${thoId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tin_nhan", filter: `tho_id=eq.${thoId}` },
        (payload: { new: TinNhan }) => {
          const tinMoi = payload.new;
          if (!tinMoi) return;

          taiDanhSachHoiThoai();

          setKhachDangChon((khachHienTai) => {
            if (khachHienTai && khachHienTai.khach_id === tinMoi.khach_id) {
              setDanhSachTinNhan((prev) => {
                const isExist = prev.some((item) => item.id === tinMoi.id);
                if (isExist) return prev;
                return [...prev, tinMoi];
              });
            }
            return khachHienTai;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [thoId]);

  const guiTinNhanTraLoi = async () => {
    if (!noiDungMoi.trim() || !khachDangChon) return;

    const currentText = noiDungMoi;
    setNoiDungMoi("");

    const { data, error } = await supabase
      .from("tin_nhan")
      .insert([
        {
          tho_id: parseInt(thoId),
          khach_id: khachDangChon.khach_id,
          sender_type: "tho",
          noi_dung: currentText,
        },
      ])
      .select();

    if (error) {
      console.error("Lỗi gửi tin nhắn — message:", error.message, "| code:", error.code);
      setNoiDungMoi(currentText);
    } else if (data && data.length > 0) {
      setDanhSachTinNhan((prev) => [...prev, data[0]]);
    }
  };

  if (!khachDangChon) {
    return (
      <div className="max-w-md mx-auto border h-screen flex flex-col bg-slate-100">
        <div className="p-4 bg-emerald-700 text-white font-bold shadow">
          <h1 className="text-base">🛠️ Bàn làm việc của Thợ #{thoId}</h1>
          <p className="text-xs text-emerald-200">
            {dangChiaSeViTri ? "📍 Đang chia sẻ vị trí" : "📍 Chưa bật định vị"} · Danh sách hội thoại
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {danhSachHoiThoai.length === 0 ? (
            <p className="text-center text-gray-400 text-sm mt-10">Chưa có khách nào nhắn tin.</p>
          ) : (
            danhSachHoiThoai.map((ht) => (
              <button
                key={ht.khach_id}
                onClick={() => chonHoiThoai(ht)}
                className="w-full text-left p-4 bg-white border-b hover:bg-gray-50 transition flex flex-col gap-1"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800">{ht.ten_khach}</span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(ht.thoi_gian_cuoi).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <span className="text-sm text-gray-500 line-clamp-1">{ht.tin_nhan_cuoi}</span>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto border h-screen flex flex-col bg-slate-100">
      <div className="p-4 bg-emerald-700 text-white font-bold flex items-center gap-3 shadow">
        <button onClick={() => setKhachDangChon(null)} className="text-xl leading-none">←</button>
        <div>
          <h1 className="text-base">{khachDangChon.ten_khach}</h1>
          {/* SĐT CHỈ HIỆN KHI ĐÃ CÓ ĐƠN XÁC NHẬN */}
          <p className="text-xs text-emerald-200">
            {khachDangChon.coDonXacNhan
              ? khachDangChon.so_dien_thoai
              : "SĐT ẩn — hiện sau khi đơn được xác nhận"}
          </p>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
        {danhSachTinNhan.length === 0 ? (
          <p className="text-center text-gray-400 text-sm mt-10">Chưa có tin nhắn nào từ khách hàng.</p>
        ) : (
          danhSachTinNhan.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-xl max-w-[80%] ${
                msg.sender_type === "tho"
                  ? "bg-emerald-600 text-white self-end rounded-br-none"
                  : "bg-white text-gray-800 self-start rounded-bl-none shadow-sm"
              }`}
            >
              <p className="text-[10px] opacity-75 mb-1 font-semibold">
                {msg.sender_type === "tho" ? "Bạn (Thợ)" : "Khách hàng"}
              </p>
              <p className="text-sm">{msg.noi_dung}</p>
            </div>
          ))
        )}
      </div>

      <div className="p-3 bg-white border-t flex gap-2">
        <input
          type="text"
          value={noiDungMoi}
          onChange={(e) => setNoiDungMoi(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && guiTinNhanTraLoi()}
          placeholder="Trả lời khách hàng..."
          className="flex-1 border rounded-full px-4 py-2 text-sm outline-none focus:border-emerald-500 text-black"
        />
        <button
          onClick={guiTinNhanTraLoi}
          className="bg-emerald-600 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-emerald-700 transition"
        >
          Gửi
        </button>
      </div>
    </div>
  );
}