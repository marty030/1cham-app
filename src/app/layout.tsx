import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "1 Chạm Dịch Vụ",
  description: "Kết nối thợ với người dùng",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}