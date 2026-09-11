"use client";
import { useState, useEffect, useRef } from "react";
import "@goongmaps/goong-js/dist/goong-js.css";
import { GOONG_API_KEY, GOONG_MAPTILES_KEY, geocodeNguocLai } from "../lib/goong";
import { LocateFixed, MapPin } from "lucide-react";

type ChonDiaChiProps = {
  onDoiDiaChi: (diaChi: string) => void;
};

type GoiYDiaChi = {
  place_id: string;
  mo_ta: string;
};


// Toạ độ trung tâm Hà Đông, Hà Nội — dùng làm điểm neo (location bias) để
// Goong ưu tiên trả kết quả tìm kiếm gần khu vực hoạt động của app trước.
const TOA_DO_MAC_DINH = { lat: 20.9721, lng: 105.7787 };



export default function ChonDiaChi({ onDoiDiaChi }: ChonDiaChiProps) {
  const [buoc, setBuoc] = useState<"nhap" | "xac_nhan">("nhap");
  const [tuKhoa, setTuKhoa] = useState("");
  const [goiY, setGoiY] = useState<GoiYDiaChi[]>([]);
  const [dangTimKiem, setDangTimKiem] = useState(false);
  const [dangDinhVi, setDangDinhVi] = useState(false);
  const [dangTaiDiaChi, setDangTaiDiaChi] = useState(false);
  const [toaDo, setToaDo] = useState<{ lat: number; lng: number } | null>(null);
  const [diaChiXacNhan, setDiaChiXacNhan] = useState("");
  const [diaChiDaChon, setDiaChiDaChon] = useState("");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Tìm gợi ý địa chỉ (debounce 400ms) khi người dùng gõ ở bước "nhap"
  useEffect(() => {
    if (buoc !== "nhap" || tuKhoa.trim().length < 3) {
      setGoiY([]);
      return;
    }

    const timer = setTimeout(async () => {
      setDangTimKiem(true);
      try {
        const res = await fetch(
          `https://rsapi.goong.io/Place/AutoComplete?api_key=${GOONG_API_KEY}&input=${encodeURIComponent(
            tuKhoa
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
        console.error("Lỗi tìm địa chỉ (Goong Autocomplete):", err);
      } finally {
        setDangTimKiem(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [tuKhoa, buoc]);

  function moBuocXacNhan(lat: number, lng: number, diaChi: string) {
    setToaDo({ lat, lng });
    setDiaChiXacNhan(diaChi);
    setBuoc("xac_nhan");
  }

  async function chonGoiY(placeId: string) {
    setDangTaiDiaChi(true);
    try {
      const res = await fetch(
        `https://rsapi.goong.io/Place/Detail?place_id=${placeId}&api_key=${GOONG_API_KEY}`
      );
      const data = await res.json();
      const vt = data?.result?.geometry?.location;
      const diaChi = data?.result?.formatted_address;
      if (vt && diaChi) {
        moBuocXacNhan(vt.lat, vt.lng, diaChi);
      } else {
        alert("Không lấy được vị trí của địa chỉ này, thử chọn địa chỉ khác nhé.");
      }
    } catch (err) {
      console.error("Lỗi lấy chi tiết địa điểm (Goong Place Detail):", err);
      alert("Có lỗi khi lấy chi tiết địa điểm, thử lại nhé.");
    } finally {
      setDangTaiDiaChi(false);
    }
  }

  function dinhViHienTai() {
    if (!navigator.geolocation) {
      alert("Trình duyệt của bạn không hỗ trợ định vị.");
      return;
    }

    setDangDinhVi(true);

    navigator.geolocation.getCurrentPosition(
      async (viTri) => {
        const { latitude, longitude } = viTri.coords;
        const diaChi = await geocodeNguocLai(latitude, longitude);
        setDangDinhVi(false);
        moBuocXacNhan(latitude, longitude, diaChi);
      },
      (loi) => {
        console.error("Lỗi lấy vị trí:", loi);
        alert("Không lấy được vị trí — kiểm tra đã bật quyền định vị cho trình duyệt chưa.");
        setDangDinhVi(false);
      }
    );
  }

  // Khởi tạo bản đồ + ghim kéo được mỗi khi vào bước "xac_nhan"
  useEffect(() => {
    if (buoc !== "xac_nhan" || !toaDo || !mapContainerRef.current) return;
    if (!GOONG_MAPTILES_KEY) return;

    let daHuy = false;

    import("@goongmaps/goong-js").then((mod: any) => {
      if (daHuy || !mapContainerRef.current) return;
      const goongjs = mod.default || mod;
      goongjs.accessToken = GOONG_MAPTILES_KEY;

      const map = new goongjs.Map({
        container: mapContainerRef.current,
        style: "https://tiles.goong.io/assets/goong_map_web.json",
        center: [toaDo.lng, toaDo.lat],
        zoom: 17,
      });
      mapRef.current = map;

      const marker = new goongjs.Marker({ draggable: true, color: "#0f766e" })
        .setLngLat([toaDo.lng, toaDo.lat])
        .addTo(map);
      markerRef.current = marker;

      marker.on("dragend", async () => {
        const lngLat = marker.getLngLat();
        setDangTaiDiaChi(true);
        const diaChiMoi = await geocodeNguocLai(lngLat.lat, lngLat.lng);
        setDangTaiDiaChi(false);
        setToaDo({ lat: lngLat.lat, lng: lngLat.lng });
        if (diaChiMoi) setDiaChiXacNhan(diaChiMoi);
      });
    });

    return () => {
      daHuy = true;
      markerRef.current?.remove?.();
      mapRef.current?.remove?.();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buoc]);

  function xacNhanDiaChi() {
    setDiaChiDaChon(diaChiXacNhan);
    onDoiDiaChi(diaChiXacNhan);
  }

  function doiDiaChi() {
    setDiaChiDaChon("");
    setBuoc("nhap");
    setTuKhoa("");
    setGoiY([]);
    onDoiDiaChi("");
  }

  if (!GOONG_API_KEY || !GOONG_MAPTILES_KEY) {
    return (
      <div className="text-xs text-rust bg-rust-soft border border-rust/20 rounded-lg px-3 py-2.5">
        Thiếu cấu hình Goong Maps — thêm <code>NEXT_PUBLIC_GOONG_API_KEY</code> và{" "}
        <code>NEXT_PUBLIC_GOONG_MAPTILES_KEY</code> vào file <code>.env.local</code>.
      </div>
    );
  }

  // Đã chọn xong — hiển thị thẻ tóm tắt gọn, kèm nút "Đổi" để chọn lại
  if (diaChiDaChon) {
    return (
      <div className="bg-teal-soft border border-teal/20 rounded-lg px-3 py-2.5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 text-sm text-teal">
          {/* Vị trí 1: Thẻ đã chọn */}
          <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{diaChiDaChon}</span>
        </div>
        <button
          type="button"
          onClick={doiDiaChi}
          className="text-xs font-semibold text-rust shrink-0 hover:underline"
        >
          Đổi
        </button>
      </div>
    );
  }

  // Bước xác nhận trên bản đồ — kéo ghim để chỉnh chính xác
  if (buoc === "xac_nhan") {
    return (
      <div className="flex flex-col gap-2">
        <div
          ref={mapContainerRef}
          className="w-full h-56 rounded-lg overflow-hidden border border-line"
        />
        <p className="text-xs text-ink-soft text-center">Kéo ghim để chỉnh đúng vị trí</p>
        <div className="bg-paper border border-line rounded-lg px-3 py-2 text-sm text-ink min-h-[2.5rem] flex items-center">
          {dangTaiDiaChi
            ? "Đang xác định địa chỉ..."
            : diaChiXacNhan || "Không xác định được địa chỉ ở vị trí này, thử kéo ghim sang chỗ khác"}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setBuoc("nhap")}
            className="flex-1 bg-line hover:bg-ink-soft hover:text-white text-ink-soft rounded-lg px-3 py-2 text-sm font-semibold transition"
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={xacNhanDiaChi}
            disabled={!diaChiXacNhan || dangTaiDiaChi}
            className="flex-1 bg-rust hover:opacity-90 text-white rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-50 transition"
          >
            Xác nhận vị trí
          </button>
        </div>
      </div>
    );
  }

  // Bước nhập — dùng vị trí hiện tại hoặc tìm kiếm theo địa chỉ
  return (
    <div className="flex flex-col gap-2">
      {/* Vị trí 2: Nút định vị */}
      <button
        type="button"
        onClick={dinhViHienTai}
        disabled={dangDinhVi}
        className="border border-teal text-teal bg-teal-soft hover:opacity-80 rounded-lg px-3 py-2 text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 transition"
      >
        <LocateFixed className="w-4 h-4" />
        {dangDinhVi ? "Đang xác định vị trí..." : "Dùng vị trí hiện tại của bạn"}
      </button>

      <p className="text-xs text-ink-soft text-center">— hoặc tìm địa chỉ —</p>

      <div className="relative">
        <input
          type="text"
          value={tuKhoa}
          onChange={(e) => setTuKhoa(e.target.value)}
          placeholder="Nhập số nhà, tên đường, phường/xã..."
          className="border border-line rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-teal"
        />
        {(goiY.length > 0 || dangTimKiem) && (
          <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-card border border-line rounded-lg shadow-md max-h-56 overflow-y-auto">
            {dangTimKiem ? (
              <p className="text-xs text-ink-soft px-3 py-2">Đang tìm...</p>
            ) : (
              goiY.map((gy) => (
                /* Vị trí 3: Item gợi ý (Thêm flex items-center gap-2 vào className nút) */
                <button
                  key={gy.place_id}
                  type="button"
                  onClick={() => chonGoiY(gy.place_id)}
                  disabled={dangTaiDiaChi}
                  className="w-full text-left px-3 py-2 text-sm text-ink hover:bg-teal-soft border-b border-line last:border-0 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-ink-soft" />
                  <span>{gy.mo_ta}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}