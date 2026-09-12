"use client";
import { useEffect, useState } from "react";

/**
 * Trả về chiều cao thực của vùng nhìn thấy (visual viewport) theo pixel,
 * tự cập nhật khi bàn phím ảo bật/tắt hoặc thanh địa chỉ trình duyệt ẩn/hiện.
 *
 * Dùng JS thay vì chỉ dựa vào CSS `dvh` vì một số webview trong app (Zalo,
 * Facebook, Messenger...) hỗ trợ đơn vị `dvh` không ổn định — dùng
 * `window.visualViewport` đáng tin cậy hơn trên các webview này.
 *
 * Trả về null ở lần render đầu tiên (server-side / trước khi đo được),
 * lúc đó nên dùng class `h-dvh` làm giá trị mặc định.
 */
export function useChieuCaoManHinhThuc(): number | null {
  const [chieuCao, setChieuCao] = useState<number | null>(null);

  useEffect(() => {
    function capNhat() {
      const vv = window.visualViewport;
      setChieuCao(vv ? vv.height : window.innerHeight);
    }

    capNhat();

    window.visualViewport?.addEventListener("resize", capNhat);
    window.addEventListener("resize", capNhat);

    return () => {
      window.visualViewport?.removeEventListener("resize", capNhat);
      window.removeEventListener("resize", capNhat);
    };
  }, []);

  return chieuCao;
}