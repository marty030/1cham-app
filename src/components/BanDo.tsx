"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Sửa lỗi icon mặc định của Leaflet không hiện đúng trong Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type BanDoProps = {
  danhSachTho: any[];
};

export default function BanDo({ danhSachTho }: BanDoProps) {
  const viTriMacDinh: [number, number] = [20.9701, 105.7469]; // Hà Đông, Hà Nội

  return (
    <MapContainer
      center={viTriMacDinh}
      zoom={13}
      style={{ height: "400px", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {danhSachTho.map((tho) =>
        tho.vi_do && tho.kinh_do ? (
          <Marker key={tho.id} position={[tho.vi_do, tho.kinh_do]}>
            <Popup>
              <strong>{tho.ten}</strong>
              <br />
              {tho.nghe}
            </Popup>
          </Marker>
        ) : null
      )}
    </MapContainer>
  );
}