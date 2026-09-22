import type { Metadata } from "next";
import Header from "../components/Header";
import { ThongBaoProvider } from "../components/ThongBao";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thợ Xịn",
  description: "Kết nối thợ với người dùng",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThongBaoProvider>
          <Header />
          <main>{children}</main>
        </ThongBaoProvider>
      </body>
    </html>
  );
}