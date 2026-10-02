"use client";
import { useEffect, useRef, useState } from "react";
import "@goongmaps/goong-js/dist/goong-js.css";
import {
  GOONG_API_KEY,
  GOONG_MAPTILES_KEY,
  geocodeNguocLai,
  layChiTietDiaDiem,
  taoVongTronGeoJSON,
} from "../lib/goong";
import { LocateFixed } from "lucide-react";
import { useThongBao } from "./ThongBao";
import GoiYDiaChi from "./GoiYDiaChi";

type ChonKhuVucHoatDongProps = {
  viDo: number | null;
  kinhDo: number | null;
  banKinh: number;
  diaChi: string;
  onDoiViTri: (lat: number, lng: number, diaChi: string) => void;
  onDoiBanKinh: (km: number) => void;
};

// Toạ độ mặc định khi thợ chưa từng đặt vị trí trung tâm — Hà Đông, Hà Nội.
const TOA_DO_MAC_DINH = { lat: 20.9721, lng: 105.7787 };
const NGUON_VONG_TRON = "vong-tron-hoat-dong";

export default function ChonKhuVucHoatDong({
  viDo,
  kinhDo,
  banKinh,
  diaChi,
  onDoiViTri,
  onDoiBanKinh,
}: ChonKhuVucHoatDongProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const banKinhRef = useRef(banKinh);
  banKinhRef.current = banKinh;

  const [dangDinhVi, setDangDinhVi] = useState(false);
  const [dangTaiDiaChi, setDangTaiDiaChi] = useState(false);
  const [tuKhoa, setTuKhoa] = useState("");
  const thongBao = useThongBao();

  const toaDoBanDau = {
    lat: viDo ?? TOA_DO_MAC_DINH.lat,
    lng: kinhDo ?? TOA_DO_MAC_DINH.lng,
  };

  function capNhatVongTron(lat: number, lng: number) {
    const map = mapRef.current;
    if (!map) return;
    const nguon = map.getSource(NGUON_VONG_TRON);
    if (nguon) nguon.setData(taoVongTronGeoJSON(lat, lng, banKinhRef.current));
  }

  // Khởi tạo bản đồ 1 lần — không tạo lại mỗi khi props đổi
  useEffect(() => {
    if (!mapContainerRef.current || !GOONG_MAPTILES_KEY) return;
    let daHuy = false;

    import("@goongmaps/goong-js").then((mod: any) => {
      if (daHuy || !mapContainerRef.current) return;
      const goongjs = mod.default || mod;
      goongjs.accessToken = GOONG_MAPTILES_KEY;

      const map = new goongjs.Map({
        container: mapContainerRef.current,
        style: "https://tiles.goong.io/assets/goong_map_web.json",
        center: [toaDoBanDau.lng, toaDoBanDau.lat],
        zoom: 13,
      });
      mapRef.current = map;

      const marker = new goongjs.Marker({ draggable: true, color: "#b45309" })
        .setLngLat([toaDoBanDau.lng, toaDoBanDau.lat])
        .addTo(map);
      markerRef.current = marker;

      map.on("load", () => {
        map.addSource(NGUON_VONG_TRON, {
          type: "geojson",
          data: taoVongTronGeoJSON(toaDoBanDau.lat, toaDoBanDau.lng, banKinhRef.current),
        });
        map.addLayer({
          id: `${NGUON_VONG_TRON}-fill`,
          type: "fill",
          source: NGUON_VONG_TRON,
          paint: { "fill-color": "#0f766e", "fill-opacity": 0.12 },
        });
        map.addLayer({
          id: `${NGUON_VONG_TRON}-line`,
          type: "line",
          source: NGUON_VONG_TRON,
          paint: { "line-color": "#0f766e", "line-width": 2 },
        });
      });

      marker.on("dragend", async () => {
        const lngLat = marker.getLngLat();
        capNhatVongTron(lngLat.lat, lngLat.lng);
        setTuKhoa("");
        setDangTaiDiaChi(true);
        const diaChiMoi = await geocodeNguocLai(lngLat.lat, lngLat.lng);
        setDangTaiDiaChi(false);
        onDoiViTri(lngLat.lat, lngLat.lng, diaChiMoi);
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
  }, []);

  // Bán kính đổi (kéo thanh trượt) — vẽ lại vòng tròn tại đúng vị trí ghim hiện tại
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    const lngLat = marker.getLngLat();
    capNhatVongTron(lngLat.lat, lngLat.lng);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banKinh]);

  // Thợ gõ địa chỉ và bấm chọn 1 gợi ý: lấy toạ độ, dời ghim + vòng tròn tới đó
  async function chonDiaChiTuGoiY(placeId: string) {
    setDangTaiDiaChi(true);
    const chiTiet = await layChiTietDiaDiem(placeId);
    setDangTaiDiaChi(false);

    if (!chiTiet) {
      thongBao("Không lấy được vị trí của địa chỉ này, thử chọn địa chỉ khác nhé.", "loi");
      return;
    }

    const map = mapRef.current;
    const marker = markerRef.current;
    if (map && marker) {
      marker.setLngLat([chiTiet.lng, chiTiet.lat]);
      map.flyTo({ center: [chiTiet.lng, chiTiet.lat], zoom: 15 });
      capNhatVongTron(chiTiet.lat, chiTiet.lng);
    }
    setTuKhoa("");
    onDoiViTri(chiTiet.lat, chiTiet.lng, chiTiet.diaChi);
  }

  function dinhViHienTai() {
    if (!navigator.geolocation) {
      thongBao("Trình duyệt của bạn không hỗ trợ định vị.", "thongtin");
      return;
    }

    setDangDinhVi(true);

    navigator.geolocation.getCurrentPosition(
      async (viTri) => {
        const { latitude, longitude } = viTri.coords;
        const map = mapRef.current;
        const marker = markerRef.current;
        if (map && marker) {
          marker.setLngLat([longitude, latitude]);
          map.flyTo({ center: [longitude, latitude], zoom: 15 });
          capNhatVongTron(latitude, longitude);
        }

        setTuKhoa("");
        setDangTaiDiaChi(true);
        const diaChiMoi = await geocodeNguocLai(latitude, longitude);
        setDangTaiDiaChi(false);
        setDangDinhVi(false);
        onDoiViTri(latitude, longitude, diaChiMoi);
      },
      (loi) => {
        console.error("Lỗi lấy vị trí:", loi);
        thongBao("Không lấy được vị trí — kiểm tra đã bật quyền định vị cho trình duyệt chưa.", "loi");
        setDangDinhVi(false);
      }
    );
  }

  if (!GOONG_API_KEY || !GOONG_MAPTILES_KEY) {
    return (
      <div className="text-xs text-rust bg-rust-soft border border-rust/20 rounded-lg px-3 py-2.5">
        Thiếu cấu hình Goong Maps — thêm <code>NEXT_PUBLIC_GOONG_API_KEY</code> và{" "}
        <code>NEXT_PUBLIC_GOONG_MAPTILES_KEY</code> vào file <code>.env.local</code>.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div>
        <label className="text-xs font-semibold text-ink-soft mb-1 block">
          Nhập địa chỉ để tìm
        </label>
        <GoiYDiaChi
          value={tuKhoa}
          onChange={setTuKhoa}
          onChonGoiY={(placeId) => chonDiaChiTuGoiY(placeId)}
          placeholder="Ví dụ: 12 Quang Trung, Hà Đông"
        />
      </div>

      <div
        ref={mapContainerRef}
        className="w-full h-56 rounded-lg overflow-hidden border border-line"
      />
      <p className="text-xs text-ink-soft text-center">
        Chọn địa chỉ gợi ý, hoặc kéo ghim để chỉnh đúng tâm khu vực hoạt động
      </p>

      <div className="bg-paper border border-line rounded-lg px-3 py-2 text-sm text-ink min-h-[2.5rem] flex items-center">
        {dangTaiDiaChi ? "Đang xác định địa chỉ..." : diaChi || "Chưa xác định địa chỉ"}
      </div>

      <button
        type="button"
        onClick={dinhViHienTai}
        disabled={dangDinhVi}
        className="flex items-center justify-center gap-1.5 border border-teal text-teal bg-teal-soft hover:opacity-80 rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-50 transition"
      >
       <LocateFixed className="w-4 h-4" />
        {dangDinhVi ? "Đang xác định vị trí..." : "Dùng vị trí hiện tại của bạn"}
      </button>

      <div>
        <label className="text-xs font-semibold text-ink-soft">
          Bán kính hoạt động: {banKinh} km
        </label>
        <input
          type="range"
          min={1}
          max={50}
          value={banKinh}
          onChange={(e) => onDoiBanKinh(Number(e.target.value))}
          className="w-full accent-teal mt-1"
        />
      </div>
    </div>
  );
}