"use client";
import { useEffect, useState } from "react";

type VungNhinThay = {
  top: number;
  height: number;
};

/**
 * Trả về vùng nhìn thấy thực (visual viewport) của trình duyệt: top + height,
 * tự cập nhật khi bàn phím ảo bật/tắt hoặc thanh địa chỉ ẩn/hiện.
 *
 * Trên iOS, khi bàn phím mở, "visual viewport" bị dịch xuống dưới
 * (offsetTop > 0) trong khi layout viewport (dùng bởi position: fixed)
 * vẫn giữ nguyên toạ độ cũ — nếu chỉ đổi height mà bỏ qua offsetTop thì
 * khung chat vẫn bị lệch. Ghim cả top lẫn height thì khung mới đứng yên
 * đúng vị trí nhìn thấy thực tế, giống các app nhắn tin gốc (Messenger...).
 *
 * Trả về null ở lần render đầu (server-side / trước khi đo được) —
 * lúc đó dùng `100dvh` + `top: 0` làm giá trị dự phòng.
 */
export function useVungNhinThayThuc(): VungNhinThay | null {
  const [vung, setVung] = useState<VungNhinThay | null>(null);

  useEffect(() => {
    function capNhat() {
      const vv = window.visualViewport;
      if (vv) {
        setVung({ top: vv.offsetTop, height: vv.height });
      } else {
        setVung({ top: 0, height: window.innerHeight });
      }
    }

    capNhat();

    window.visualViewport?.addEventListener("resize", capNhat);
    window.visualViewport?.addEventListener("scroll", capNhat);
    window.addEventListener("resize", capNhat);

    return () => {
      window.visualViewport?.removeEventListener("resize", capNhat);
      window.visualViewport?.removeEventListener("scroll", capNhat);
      window.removeEventListener("resize", capNhat);
    };
  }, []);

  return vung;
}