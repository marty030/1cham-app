"use client";
import { useCallback, useEffect, useRef, useState } from "react";

// Khóa công khai của Cloudflare Turnstile. Nếu CHƯA đặt biến này thì CAPTCHA tự tắt
// (không hiện gì, không chặn đăng nhập) — để bạn có thể đưa code lên trước, bật CAPTCHA sau.
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type TurnstileApi = {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      language?: string;
      appearance?: "always" | "execute" | "interaction-only";
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    }
  ) => string;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_ID = "cf-turnstile-script";

function napScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.turnstile) {
      resolve();
      return;
    }
    const daCo = document.getElementById(SCRIPT_ID);
    if (daCo) {
      daCo.addEventListener("load", () => resolve());
      daCo.addEventListener("error", () => reject(new Error("Không tải được Turnstile")));
      return;
    }
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Không tải được Turnstile"));
    document.head.appendChild(s);
  });
}

function OCaptcha({ onToken }: { onToken: (token: string | null) => void }) {
  const khung = useRef<HTMLDivElement>(null);
  const onTokenRef = useRef(onToken);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!SITE_KEY) return;
    let daHuy = false;
    let widgetId: string | null = null;

    napScript()
      .then(() => {
        if (daHuy || !khung.current || !window.turnstile) return;
        widgetId = window.turnstile.render(khung.current, {
          sitekey: SITE_KEY,
          language: "vi",
          appearance: "interaction-only",
          callback: (token) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(null),
          "error-callback": () => onTokenRef.current(null),
        });
      })
      .catch(() => onTokenRef.current(null));

    return () => {
      daHuy = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, []);

  if (!SITE_KEY) return null;
  return <div ref={khung} className="flex justify-center" />;
}

// Cách dùng trong một trang:
//   const { token, lamMoi, oCaptcha, canCaptcha } = useCaptcha();
//   - đặt {oCaptcha} gần nút bấm
//   - trước khi gọi Supabase: if (canCaptcha && !token) { báo "đợi vài giây"; return; }
//   - truyền options: { captchaToken: token ?? undefined } vào signUp / signInWithPassword
//   - SAU MỖI LẦN gọi (dù thành công hay lỗi) phải gọi lamMoi(), vì mỗi mã chỉ dùng được 1 lần
export function useCaptcha() {
  const [token, setToken] = useState<string | null>(null);
  const [lan, setLan] = useState(0);

  const lamMoi = useCallback(() => {
    setToken(null);
    setLan((n) => n + 1);
  }, []);

  const oCaptcha = <OCaptcha key={lan} onToken={setToken} />;

  return { token, lamMoi, oCaptcha, canCaptcha: Boolean(SITE_KEY) };
}

export const THONG_BAO_DOI_CAPTCHA =
  "Đang xác minh bạn không phải robot. Vui lòng đợi vài giây rồi bấm lại.";