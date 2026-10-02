"use client";
import { useState, useEffect, useRef } from "react";
import { GOONG_API_KEY } from "../lib/goong";
import { MapPin } from "lucide-react";

type GoiYDiaChiProps = {
  value: string;
  onChange: (diaChi: string) => void;
  placeholder?: string;
  // Tuỳ chọn: được gọi khi người dùng bấm chọn 1 gợi ý, kèm place_id để nơi dùng
  // tự lấy toạ độ (Place/Detail) nếu cần. Không truyền thì hành vi như cũ.
  onChonGoiY?: (placeId: string, moTa: string) => void;
};

type MucGoiY = {
  place_id: string;
  mo_ta: string;
};

// Toạ độ trung tâm Hà Đông, Hà Nội — dùng làm điểm neo (location bias) để
// Goong ưu tiên trả kết quả tìm kiếm gần khu vực hoạt động của app trước.
const TOA_DO_MAC_DINH = { lat: 20.9721, lng: 105.7787 };

// Ô nhập địa chỉ có gợi ý (autocomplete) đơn giản, KHÔNG kèm bản đồ/toạ độ —
// dùng cho những chỗ chỉ cần lưu chuỗi địa chỉ (vd. đăng ký thợ), khác với
// ChonDiaChi.tsx (có bước xác nhận trên bản đồ để lấy toạ độ vi_do/kinh_do).
export default function GoiYDiaChi({ value, onChange, placeholder, onChonGoiY }: GoiYDiaChiProps) {
  const [goiY, setGoiY] = useState<MucGoiY[]>([]);
  const [dangHienGoiY, setDangHienGoiY] = useState(false);
  const [dangTimKiem, setDangTimKiem] = useState(false);
  const boChuaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.trim().length < 3 || !dangHienGoiY) {
      setGoiY([]);
      return;
    }

    const timer = setTimeout(async () => {
      setDangTimKiem(true);
      try {
        const res = await fetch(
          `https://rsapi.goong.io/Place/AutoComplete?api_key=${GOONG_API_KEY}&input=${encodeURIComponent(
            value
          )}&location=${TOA_DO_MAC_DINH.lat},${TOA_DO_MAC_DINH.lng}&radius=50000`
        );
        const data = await res.json();
        setGoiY(
          (data.predictions || []).map((p: any) => ({
            place_id: p.place_id,
            mo_ta: p.description,
          }))
        );
      } catch (err) {
        console.error("Lỗi tìm gợi ý địa chỉ (Goong):", err);
      } finally {
        setDangTimKiem(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [value, dangHienGoiY]);

  // Đóng danh sách gợi ý khi bấm ra ngoài
  useEffect(() => {
    function xuLyClickNgoai(e: MouseEvent) {
      if (boChuaRef.current && !boChuaRef.current.contains(e.target as Node)) {
        setDangHienGoiY(false);
      }
    }
    document.addEventListener("mousedown", xuLyClickNgoai);
    return () => document.removeEventListener("mousedown", xuLyClickNgoai);
  }, []);

  function chonGoiY(placeId: string, mo_ta: string) {
    onChange(mo_ta);
    setGoiY([]);
    setDangHienGoiY(false);
    onChonGoiY?.(placeId, mo_ta);
  }

  return (
    <div ref={boChuaRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setDangHienGoiY(true);
        }}
        onFocus={() => setDangHienGoiY(true)}
        placeholder={placeholder ?? "Nhập địa chỉ..."}
        className="w-full px-4 py-2.5 rounded-lg border border-line focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none transition-all"
        autoComplete="off"
      />

      {dangHienGoiY && (dangTimKiem || goiY.length > 0) && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-card border border-line rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
          {dangTimKiem && goiY.length === 0 ? (
            <p className="px-4 py-3 text-sm text-ink-soft">Đang tìm...</p>
          ) : (
            goiY.map((g) => (
              <button
                key={g.place_id}
                type="button"
                onClick={() => chonGoiY(g.place_id, g.mo_ta)}
                className="w-full text-left px-4 py-2.5 text-sm text-ink hover:bg-paper transition flex items-start gap-2 border-b border-line last:border-0"
              >
                <MapPin className="w-4 h-4 text-ink-soft mt-0.5 shrink-0" />
                <span className="line-clamp-2">{g.mo_ta}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}