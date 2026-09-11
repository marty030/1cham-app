export const GOONG_API_KEY = process.env.NEXT_PUBLIC_GOONG_API_KEY || "";
export const GOONG_MAPTILES_KEY = process.env.NEXT_PUBLIC_GOONG_MAPTILES_KEY || "";

export async function geocodeNguocLai(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://rsapi.goong.io/Geocode?latlng=${lat},${lng}&api_key=${GOONG_API_KEY}`
    );
    const data = await res.json();
    return data?.results?.[0]?.formatted_address || "";
  } catch (err) {
    console.error("Lỗi reverse geocode (Goong):", err);
    return "";
  }
}

/**
 * Dựng một polygon GeoJSON hình tròn (xấp xỉ bằng đa giác nhiều cạnh) tâm
 * (lat, lng), bán kính tính theo km — dùng để vẽ vùng hoạt động lên bản đồ
 * goong-js dưới dạng fill/line layer.
 */
export function taoVongTronGeoJSON(lat: number, lng: number, banKinhKm: number, soDiem = 64) {
  const R = 6371; // bán kính Trái Đất (km)
  const toaDo: [number, number][] = [];

  for (let i = 0; i <= soDiem; i++) {
    const goc = (i / soDiem) * 2 * Math.PI;
    const dLat = (banKinhKm / R) * Math.cos(goc);
    const dLng = ((banKinhKm / R) * Math.sin(goc)) / Math.cos((lat * Math.PI) / 180);
    toaDo.push([lng + (dLng * 180) / Math.PI, lat + (dLat * 180) / Math.PI]);
  }

  return {
    type: "Feature" as const,
    geometry: { type: "Polygon" as const, coordinates: [toaDo] },
    properties: {},
  };
}