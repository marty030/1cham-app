"use client";
import Link from "next/link";
import { DANH_MUC_NGHE } from "../lib/danhMuc";
import Footer from "../components/Footer";
import ThanhDieuHuong from "../components/ThanhDieuHuong";
import { useTaiKhoanHienTai } from "../hooks/useTaiKhoanHienTai";
import {
  ShieldCheck,
  MessageCircle,
  Star,
  CalendarClock,
  Search,
  Handshake,
  CheckCircle2,
  Snowflake,
  Droplets,
  WashingMachine,
  Wrench,
  ArrowRight,
} from "lucide-react";

const ICON_DANH_MUC: Record<string, typeof Snowflake> = {
  dien_lanh: Snowflake,
  dien_nuoc: Droplets,
  do_gia_dung: WashingMachine,
  khac: Wrench,
};

const CAM_KET = [
  {
    icon: MessageCircle,
    tieuDe: "Chat & chốt giá trước khi thợ đến",
    moTa: "Trao đổi trực tiếp với thợ, thống nhất giá và tình trạng hư hỏng — không đặt cọc mù, không lo phát sinh bất ngờ.",
  },
  {
    icon: Star,
    tieuDe: "Đánh giá sao công khai",
    moTa: "Mọi đơn đã hoàn thành đều được khách chấm sao — ai cũng xem được, không giấu đánh giá xấu.",
  },
  {
    icon: ShieldCheck,
    tieuDe: "Hồ sơ thợ minh bạch",
    moTa: "Cấp bậc của thợ được tính từ số đơn thực tế đã hoàn thành, không phải tự nhận.",
  },
  {
    icon: CalendarClock,
    tieuDe: "Linh hoạt theo nhu cầu",
    moTa: "Cần gấp thì gọi ngay, không gấp thì đặt lịch đúng khung giờ bạn rảnh.",
  },
];

const CAC_BUOC = [
  {
    icon: Search,
    tieuDe: "1. Tìm thợ",
    moTa: "Chọn đúng ngành bạn cần, xem thợ gần bạn nhất kèm khoảng cách cụ thể.",
  },
  {
    icon: Handshake,
    tieuDe: "2. Thống nhất & đặt",
    moTa: "Chat hỏi giá trước hoặc đặt lịch/gọi ngay — mọi thứ rõ ràng trước khi thợ tới.",
  },
  {
    icon: CheckCircle2,
    tieuDe: "3. Hoàn thành & đánh giá",
    moTa: "Thợ xong việc, bạn xác nhận và chấm sao — giúp người sau chọn thợ tốt hơn.",
  },
];

export default function TrangChu() {
  const { daDangNhap, laAdmin, hoSoKhach, dangXuat } = useTaiKhoanHienTai();

  return (
    <div className="min-h-screen bg-paper">
      <ThanhDieuHuong
        daDangNhap={daDangNhap}
        laAdmin={laAdmin}
        hoSoKhach={hoSoKhach}
        onDangXuat={dangXuat}
        bienThe="gon"
      />

      {/* HERO */}
      <section className="text-center max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-14">
        <div className="inline-flex items-center gap-1.5 bg-teal-soft text-teal text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
          <ShieldCheck className="w-3.5 h-3.5" />
          Uy tín · Minh bạch · Giá rõ trước khi làm
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-ink mb-4 leading-tight">
          Gọi thợ sửa chữa gia dụng,
          <br />
          không lo bị chặt chém
        </h1>
        <p className="text-ink-soft mb-7">
          Kết nối với thợ điện lạnh, điện nước, đồ gia dụng gần bạn tại khu vực Hà Đông,
          Hà Nội. Chat thống nhất giá trước — thợ chỉ đến khi cả hai đã đồng ý.
        </p>
<a
        
          href="#danh-muc"
          className="inline-flex items-center gap-2 bg-rust hover:opacity-90 transition text-white px-6 py-3 rounded-xl shadow-md font-semibold"
        >
          Tìm thợ ngay <ArrowRight className="w-4 h-4" />
        </a>
      </section>

      {/* CAM KẾT CỐT LÕI */}
      <section className="bg-card border-y border-line py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-xl font-bold text-ink mb-8">
           Vì sao chọn Thợ Xịn?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CAM_KET.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.tieuDe}
                  className="bg-paper border border-line rounded-2xl p-5 flex flex-col gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-soft text-teal flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-ink text-sm">{item.tieuDe}</h3>
                  <p className="text-xs text-ink-soft leading-relaxed">{item.moTa}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CÁCH HOẠT ĐỘNG */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-xl font-bold text-ink mb-8">Cách hoạt động</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {CAC_BUOC.map((buoc) => {
              const Icon = buoc.icon;
              return (
                <div key={buoc.tieuDe} className="flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-rust-soft text-rust flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-ink">{buoc.tieuDe}</h3>
                  <p className="text-sm text-ink-soft leading-relaxed max-w-xs">{buoc.moTa}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DANH MỤC NGÀNH */}
      <section id="danh-muc" className="bg-card border-t border-line py-14 px-4 sm:px-6 scroll-mt-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center text-xl font-bold text-ink mb-1">Bạn cần sửa gì?</h2>
          <p className="text-center text-sm text-ink-soft mb-8">Chọn đúng ngành để xem thợ gần bạn nhất</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {DANH_MUC_NGHE.map((muc) => {
              const Icon = ICON_DANH_MUC[muc.gia_tri] ?? Wrench;
              return (
                <Link key={muc.gia_tri} href={`/tho-gan-ban?danh_muc=${muc.gia_tri}`}>
                  <div className="bg-paper border border-line rounded-2xl p-5 flex flex-col items-center gap-3 text-center shadow-sm hover:shadow-md hover:border-rust/40 transition-all cursor-pointer h-full">
                    <div className="w-12 h-12 rounded-xl bg-teal-soft text-teal flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-semibold text-ink">{muc.nhan}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center">
            <Link
              href="/tho-gan-ban"
              className="inline-flex items-center gap-1.5 text-rust hover:underline font-medium"
            >
              Xem tất cả thợ gần bạn <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}