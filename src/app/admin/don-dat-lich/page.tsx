"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import { TUY_CHON_GIO_VN } from "../../../lib/thoiGianVN";
import { ClipboardList, Flag } from "lucide-react";
import NhanTrangThai from "../../../components/NhanTrangThai";
import { useThongBao } from "../../../components/ThongBao";
import { dichLoiSupabase } from "../../../lib/dichLoi";

type BaoCao = {
  id: number;
  don_id: number;
  nguoi_bao: "tho" | "khach";
  noi_dung: string;
  trang_thai: "moi" | "da_xu_ly";
  tao_luc: string;
  xu_ly_luc: string | null;
  ghi_chu_admin: string | null;
};

export default function DonDatLich() {
  const [danhSachDon, setDanhSachDon] = useState<any[]>([]);
  const [baoCaoTheoDon, setBaoCaoTheoDon] = useState<Record<number, BaoCao[]>>({});
  const [ghiChuXuLy, setGhiChuXuLy] = useState<Record<number, string>>({});
  const [daDangNhap, setDaDangNhap] = useState<boolean | null>(null);
  const [chiCoBaoCao, setChiCoBaoCao] = useState(false);
  const router = useRouter();
  const thongBao = useThongBao();

  useEffect(() => {
    async function kiemTra() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/login");
      } else {
        setDaDangNhap(true);
      }
    }
    kiemTra();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function layDonDatLich() {
    const { data, error } = await supabase
      .from("don_dat_lich")
      .select("*, tho(ten)")
      .order("id", { ascending: false });
    if (error) {
      console.log("Lỗi:", error);
    } else {
      setDanhSachDon(data);
    }

    // Báo cáo vấn đề: chỉ admin đọc được toàn bộ (policy ở database); tài khoản khác sẽ nhận về rỗng
    const { data: baoCao, error: loiBaoCao } = await supabase
      .from("bao_cao_van_de")
      .select("*")
      .order("tao_luc", { ascending: false });
    if (loiBaoCao) {
      console.log("Lỗi tải báo cáo:", loiBaoCao);
    } else {
      const nhom: Record<number, BaoCao[]> = {};
      for (const bc of (baoCao ?? []) as BaoCao[]) {
        (nhom[bc.don_id] ??= []).push(bc);
      }
      setBaoCaoTheoDon(nhom);
    }
  }

  useEffect(() => {
    if (!daDangNhap) return;
    layDonDatLich();
  }, [daDangNhap]);

  async function doiTrangThai(idDon: number, trangThaiMoi: string) {
    const { error } = await supabase
      .from("don_dat_lich")
      .update({ trang_thai: trangThaiMoi })
      .eq("id", idDon);
    if (error) {
      thongBao("Lỗi: " + dichLoiSupabase(error.message), "loi");
    } else {
      layDonDatLich();
    }
  }

  async function danhDauDaXuLy(baoCao: BaoCao) {
    const { data, error } = await supabase
      .from("bao_cao_van_de")
      .update({
        trang_thai: "da_xu_ly",
        ghi_chu_admin: (ghiChuXuLy[baoCao.id] ?? "").trim() || null,
      })
      .eq("id", baoCao.id)
      .select("id");
    if (error) {
      thongBao("Lỗi: " + dichLoiSupabase(error.message), "loi");
    } else if (!data || data.length === 0) {
      thongBao("Không cập nhật được — tài khoản này có phải admin không?", "loi");
    } else {
      thongBao("Đã đánh dấu đã xử lý. Đơn được mở khóa hoàn thành.", "thanhcong");
      layDonDatLich();
    }
  }

  if (!daDangNhap) return <p className="p-8 text-ink-soft">Đang kiểm tra đăng nhập...</p>;

  const soDonCoBaoCaoMo = danhSachDon.filter((d) =>
    (baoCaoTheoDon[d.id] ?? []).some((bc) => bc.trang_thai === "moi")
  ).length;

  const danhSachHienThi = chiCoBaoCao
    ? danhSachDon.filter((d) => (baoCaoTheoDon[d.id] ?? []).length > 0)
    : danhSachDon;

  return (
    <div className="min-h-screen bg-paper p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-4 flex items-center gap-2">
          <ClipboardList className="w-6 h-6" /> Danh sách đơn đặt lịch (Admin)
        </h1>

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setChiCoBaoCao((v) => !v)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition ${
              chiCoBaoCao ? "bg-rust text-white" : "bg-card border border-line text-ink-soft hover:bg-line"
            }`}
          >
            <Flag className="w-4 h-4" /> Chỉ đơn có báo cáo
          </button>
          <span className="text-sm text-ink-soft">
            {soDonCoBaoCaoMo > 0 ? (
              <span className="font-semibold text-rust">{soDonCoBaoCaoMo} đơn có báo cáo chờ xử lý</span>
            ) : (
              "Không có báo cáo nào chờ xử lý"
            )}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {danhSachHienThi.map((don) => {
            const baoCaoCuaDon = baoCaoTheoDon[don.id] ?? [];
            const coBaoCaoMo = baoCaoCuaDon.some((bc) => bc.trang_thai === "moi");
            return (
              <div
                key={don.id}
                className={`bg-card border rounded-2xl p-5 shadow-sm flex flex-col gap-1.5 text-sm text-ink-soft ${
                  coBaoCaoMo ? "border-rust/50" : "border-line"
                }`}
              >
                {baoCaoCuaDon.length > 0 && (
                  <span
                    className={`self-start inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full mb-1 ${
                      coBaoCaoMo ? "bg-rust text-white" : "bg-line text-ink-soft"
                    }`}
                  >
                    <Flag className="w-3 h-3" /> {coBaoCaoMo ? "Có báo cáo chờ xử lý" : "Có báo cáo (đã xử lý)"}
                  </span>
                )}
                <p><span className="font-semibold text-ink">Đơn:</span> #{don.id}</p>
                <p><span className="font-semibold text-ink">Khách:</span> {don.ten_khach}</p>
                <p><span className="font-semibold text-ink">SĐT:</span> {don.so_dien_thoai}</p>
                <p><span className="font-semibold text-ink">Thợ:</span> {don.tho?.ten}</p>
                <p><span className="font-semibold text-ink">Giờ hẹn:</span> {new Date(don.gio_hen).toLocaleString("vi-VN", TUY_CHON_GIO_VN)}</p>
                <p>
                  <span className="font-semibold text-ink">Xác nhận hoàn thành:</span>{" "}
                  thợ {don.tho_xac_nhan_hoan_thanh ? "✓" : "—"} · khách {don.khach_xac_nhan_hoan_thanh ? "✓" : "—"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-semibold text-ink">Trạng thái:</span>
                  <NhanTrangThai trangThai={don.trang_thai} />
                </div>

                {baoCaoCuaDon.map((bc) => (
                  <div key={bc.id} className="mt-2 bg-paper border border-line rounded-xl p-3 flex flex-col gap-1.5">
                    <p className="text-xs text-ink-soft">
                      <span className="font-semibold text-ink">
                        {bc.nguoi_bao === "tho" ? "Thợ" : "Khách"} báo
                      </span>{" "}
                      lúc {new Date(bc.tao_luc).toLocaleString("vi-VN", TUY_CHON_GIO_VN)} ·{" "}
                      {bc.trang_thai === "moi" ? (
                        <span className="font-semibold text-rust">chờ xử lý</span>
                      ) : (
                        <span className="font-semibold text-teal">đã xử lý</span>
                      )}
                    </p>
                    <p className="text-ink whitespace-pre-wrap">{bc.noi_dung}</p>
                    {bc.trang_thai === "moi" ? (
                      <div className="flex flex-col gap-2 mt-1">
                        <input
                          value={ghiChuXuLy[bc.id] ?? ""}
                          onChange={(e) => setGhiChuXuLy((truoc) => ({ ...truoc, [bc.id]: e.target.value }))}
                          placeholder="Ghi chú xử lý (không bắt buộc)"
                          className="border border-line rounded-lg px-3 py-2 text-sm text-ink bg-card outline-none focus:border-teal"
                        />
                        <button
                          onClick={() => danhDauDaXuLy(bc)}
                          className="self-start bg-teal hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                        >
                          Đánh dấu đã xử lý
                        </button>
                      </div>
                    ) : (
                      bc.ghi_chu_admin && (
                        <p className="text-xs text-ink-soft">Ghi chú xử lý: {bc.ghi_chu_admin}</p>
                      )
                    )}
                  </div>
                ))}

                <select
                  value={don.trang_thai}
                  onChange={(e) => doiTrangThai(don.id, e.target.value)}
                  className="border border-line rounded-lg px-3 py-2 mt-2 text-ink bg-card outline-none focus:border-teal"
                >
                  <option value="Chờ xác nhận">Chờ xác nhận</option>
                  <option value="Đã xác nhận">Đã xác nhận</option>
                  <option value="Đã hoàn thành">Đã hoàn thành</option>
                  <option value="Đã hủy">Đã hủy</option>
                </select>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}