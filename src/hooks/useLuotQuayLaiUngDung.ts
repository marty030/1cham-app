"use client";
import { useEffect, useState } from "react";

// Trả về một con số tăng lên mỗi khi người dùng QUAY LẠI ứng dụng:
//  - visibilitychange: đổi tab / mở lại app từ nền trên điện thoại
//  - focus: cửa sổ được chọn lại (máy tính)
//  - pageshow: trang được khôi phục từ bộ nhớ đệm khi bấm nút Back (bfcache)
// Đưa con số này vào mảng phụ thuộc của useEffect để dữ liệu tự tính lại khi quay lại app.
// Các sự kiện trên thường bắn gần như cùng lúc nên chỉ tính 1 lần trong mỗi 2 giây.
export function useLuotQuayLaiUngDung(): number {
  const [luot, setLuot] = useState(0);

  useEffect(() => {
    let lanCuoi = 0;

    function lamMoi() {
      if (document.visibilityState !== "visible") return;
      const bayGio = Date.now();
      if (bayGio - lanCuoi < 2000) return;
      lanCuoi = bayGio;
      setLuot((n) => n + 1);
    }

    document.addEventListener("visibilitychange", lamMoi);
    window.addEventListener("focus", lamMoi);
    window.addEventListener("pageshow", lamMoi);
    return () => {
      document.removeEventListener("visibilitychange", lamMoi);
      window.removeEventListener("focus", lamMoi);
      window.removeEventListener("pageshow", lamMoi);
    };
  }, []);

  return luot;
}