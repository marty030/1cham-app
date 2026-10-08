"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { layHoSoKhachHienTai } from "../../../lib/khach";
import KhoiLichHen, { dinhDangGioNgan } from "../../../components/KhoiLichHen";
import ChonKhungGio from "../../../components/ChonKhungGio";
import GoiYDiaChi from "../../../components/GoiYDiaChi";
import ThanhHaiBuoc from "../../../components/ThanhHaiBuoc";
import NutBaoVanDe from "../../../components/NutBaoVanDe";
import NhacDonBoQuen from "../../../components/NhacDonBoQuen";
import {
  Car,
  StickyNote,
  CheckCircle2,
  Star,
  Send,
  PencilLine,
  XCircle,
  Lock,
} from "lucide-react";
import NhanTrangThai from "../../../components/NhanTrangThai";
import { useThongBao, useXacNhan } from "../../../components/ThongBao";
import { dichLoiSupabase } from "../../../lib/dichLoi";
import { chuanHoaSdt, sdtHopLe } from "../../../lib/dangNhapSdt";
import {
  bayGioVN,
  daToiGioHen,
  gioHenSangChuoiVN,
  gioHenSangISOVN,
  layNhacDon,
  nhanMoKhoa,
} from "../../../lib/gioHen";

type DonDatLich = {
  id: number;
  trang_thai: string;
  gio_hen: string;
  gio_du_kien_den: string | null;
  dia_chi_hen: string;
  ghi_chu: string | null;
  ten_khach: string | null;
  so_dien_thoai: string | null;
  che_do_dat_lich: string | null;
  tho_id: number;
  khach_id: number | null;
  tho_xac_nhan_hoan_thanh: boolean;
  khach_xac_nhan_hoan_thanh: boolean;
  chinh_sua_luc: string | null;
  hoan_thanh_luc: string | null;
  tao_luc: string | null;
  tho: { ten: string } | null;
};

export default function DonDetail() {
  const params = useParams();
  const donId = params.id as string;

  const [don, setDon] = useState<DonDatLich | null>(null);
  const [loading, setLoading] = useState(true);
  const [khongTimThay, setKhongTimThay] = useState(false);
  const [daGuiDanhGia, setDaGuiDanhGia] = useState(false);
  const [soSao, setSoSao] = useState(0);
  const [binhLuan, setBinhLuan] = useState("");
  const [dangGui, setDangGui] = useState(false);
  const [dangXacNhan, setDangXacNhan] = useState(false);
  const [laChuDon, setLaChuDon] = useState(false);
  const [coBaoCao, setCoBaoCao] = useState(false);
  const thongBao = useThongBao();
  const xacNhanHopThoai = useXacNhan();

  // Form sửa đơn (chỉ khi đơn còn "Chờ xác nhận")
  const [dangSua, setDangSua] = useState(false);
  const [dangLuu, setDangLuu] = useState(false);
  const [formTen, setFormTen] = useState("");
  const [formSdt, setFormSdt] = useState("");
  const [formGio, setFormGio] = useState("");
  const [formDiaChi, setFormDiaChi] = useState("");
  const [formGhiChu, setFormGhiChu] = useState("");

  useEffect(() => {
    layDon();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [donId]);

  async function layDon() {
    setLoading(true);
    const { data, error } = await supabase
      .from("don_dat_lich")
      .select("*, tho(ten)")
      .eq("id", donId)
      .single();

    if (error || !data) {
      console.error("Không lấy được đơn:", error);
      setKhongTimThay(true);
    } else {
      const donData = data as unknown as DonDatLich;
      setDon(donData);

      const hoSo = await layHoSoKhachHienTai();
      setLaChuDon(!!hoSo && !!donData.khach_id && hoSo.id === donData.khach_id);
    }
    setLoading(false);
  }

  async function xacNhanHoanThanh() {
    if (!don) return;
    if (!daToiGioHen(don.gio_hen)) {
      thongBao(`Chưa đến giờ hẹn, bạn có thể xác nhận hoàn thành từ ${nhanMoKhoa(don.gio_hen)}.`, "canhbao");
      return;
    }

    const dongY = await xacNhanHopThoai(
      "Xác nhận công việc đã hoàn thành (và đã thanh toán nếu có)? Bạn không thể rút lại. Đơn chỉ chính thức hoàn thành khi cả thợ và khách cùng xác nhận."
    );
    if (!dongY) return;

    setDangXacNhan(true);

    // Đọc lại cờ của thợ ngay lúc bấm: dữ liệu trên màn hình có thể đã cũ (thợ vừa xác nhận
    // sau khi bạn mở trang). Nếu đọc lỗi thì dùng tạm dữ liệu đang có.
    const { data: donMoiNhat } = await supabase
      .from("don_dat_lich")
      .select("tho_xac_nhan_hoan_thanh")
      .eq("id", don.id)
      .single();
    const thoDaXacNhan = donMoiNhat
      ? donMoiNhat.tho_xac_nhan_hoan_thanh === true
      : don.tho_xac_nhan_hoan_thanh;

    const capNhat: Record<string, any> = { khach_xac_nhan_hoan_thanh: true };
    if (thoDaXacNhan) {
      capNhat.trang_thai = "Đã hoàn thành";
    }

    // Hiển thị theo CHÍNH dòng database trả về (database cũng tự chuyển "Đã hoàn thành" khi đủ hai bên)
    const { data, error } = await supabase
      .from("don_dat_lich")
      .update(capNhat)
      .eq("id", don.id)
      .select("*");

    setDangXacNhan(false);

    if (error || !data || data.length === 0) {
      thongBao(error?.message ? dichLoiSupabase(error.message) : "Có lỗi khi xác nhận, thử lại nhé.", "loi");
      return;
    }

    const donMoi = data[0] as unknown as DonDatLich;
    setDon({ ...don, ...donMoi });
    thongBao(
      donMoi.trang_thai === "Đã hoàn thành"
        ? "Đơn đã hoàn thành! Bạn hãy đánh giá thợ nhé."
        : "Đã ghi nhận bạn hoàn thành. Đơn sẽ hoàn thành khi thợ cũng xác nhận.",
      "thanhcong"
    );
  }

  async function huyDon() {
    if (!don) return;
    const daXacNhan = don.trang_thai === "Đã xác nhận";
    const dongY = await xacNhanHopThoai(
      daXacNhan
        ? "Hủy đơn đã được thợ xác nhận? Thợ đã sắp xếp lịch theo đơn này — nên báo thợ trước nếu có thể. Không thể hoàn tác."
        : "Hủy đơn này? Bạn sẽ cần đặt lịch lại nếu vẫn cần thợ."
    );
    if (!dongY) return;

    const { error } = await supabase
      .from("don_dat_lich")
      .update({ trang_thai: "Đã hủy" })
      .eq("id", don.id);

    if (error) {
      thongBao("Lỗi: " + dichLoiSupabase(error.message), "loi");
    } else {
      setDon({ ...don, trang_thai: "Đã hủy" });
      thongBao("Đã hủy đơn.", "thanhcong");
    }
  }

  function moFormSua() {
    if (!don) return;
    setFormTen(don.ten_khach ?? "");
    setFormSdt(don.so_dien_thoai ?? "");
    setFormGio(gioHenSangISOVN(don.gio_hen));
    setFormDiaChi(don.dia_chi_hen ?? "");
    setFormGhiChu(don.ghi_chu ?? "");
    setDangSua(true);
  }

  async function luuSuaDon() {
    if (!don) return;

    const tenMoi = formTen.trim();
    const diaChiMoi = formDiaChi.trim();
    if (!tenMoi) {
      thongBao("Tên không được để trống.", "canhbao");
      return;
    }
    if (!sdtHopLe(formSdt)) {
      thongBao("Số điện thoại cần đủ 10 số và bắt đầu bằng 0.", "canhbao");
      return;
    }
    if (!diaChiMoi) {
      thongBao("Địa chỉ không được để trống.", "canhbao");
      return;
    }

    // Chỉ gửi những cột thật sự thay đổi
    const capNhat: Record<string, any> = {};
    if (tenMoi !== (don.ten_khach ?? "")) capNhat.ten_khach = tenMoi;
    if (chuanHoaSdt(formSdt) !== chuanHoaSdt(don.so_dien_thoai ?? "")) {
      capNhat.so_dien_thoai = chuanHoaSdt(formSdt);
    }
    if (diaChiMoi !== don.dia_chi_hen) capNhat.dia_chi_hen = diaChiMoi;
    if ((formGhiChu.trim() || null) !== (don.ghi_chu ?? null)) {
      capNhat.ghi_chu = formGhiChu.trim() || null;
    }
    if (
      don.che_do_dat_lich !== "ngay_bay_gio" &&
      formGio &&
      gioHenSangChuoiVN(formGio) !== gioHenSangChuoiVN(don.gio_hen)
    ) {
      if (gioHenSangChuoiVN(formGio) <= bayGioVN()) {
        thongBao("Giờ hẹn mới phải ở tương lai.", "canhbao");
        return;
      }
      capNhat.gio_hen = formGio;
    }

    if (Object.keys(capNhat).length === 0) {
      thongBao("Bạn chưa thay đổi gì.", "thongtin");
      setDangSua(false);
      return;
    }

    setDangLuu(true);
    // .eq("trang_thai") để nếu thợ vừa xác nhận thì không sửa lén lên đơn đã chốt
    const { data, error } = await supabase
      .from("don_dat_lich")
      .update(capNhat)
      .eq("id", don.id)
      .eq("trang_thai", "Chờ xác nhận")
      .select("*, tho(ten)");
    setDangLuu(false);

    if (error) {
      thongBao("Lỗi: " + dichLoiSupabase(error.message), "loi");
      return;
    }
    if (!data || data.length === 0) {
      thongBao("Thợ vừa xác nhận (hoặc đơn đã thay đổi) nên không sửa được nữa. Đã tải lại đơn.", "canhbao");
      setDangSua(false);
      await layDon();
      return;
    }
    setDon(data[0] as unknown as DonDatLich);
    setDangSua(false);
    thongBao("Đã cập nhật đơn. Thợ sẽ thấy đơn này có nhãn 'đã chỉnh sửa'.", "thanhcong");
  }

  async function guiDanhGia() {
    if (!don || soSao === 0) return;
    setDangGui(true);

    const { error } = await supabase.from("danh_gia").insert({
      don_dat_lich_id: don.id,
      tho_id: don.tho_id,
      so_sao: soSao,
      binh_luan: binhLuan.trim() || null,
    });

    setDangGui(false);
    if (!error) {
      setDaGuiDanhGia(true);
    } else {
      thongBao(error.message ? dichLoiSupabase(error.message) : "Có lỗi khi gửi đánh giá, thử lại nhé.", "loi");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rust"></div>
      </div>
    );
  }

  if (khongTimThay || !don) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper p-6">
        <div className="text-center max-w-sm">
          <p className="text-ink-soft mb-3">
            Không tìm thấy đơn này, hoặc bạn chưa đăng nhập đúng tài khoản đã đặt đơn.
          </p>
          <Link
            href={`/login?next=${encodeURIComponent(`/don/${donId}`)}`}
            className="text-rust font-semibold hover:underline"
          >
            Đăng nhập để xem đơn →
          </Link>
        </div>
      </div>
    );
  }

  const daToiGio = daToiGioHen(don.gio_hen);
  const nhac = laChuDon ? layNhacDon(don, "khach") : null;
  const hienThanhHaiBuoc = don.trang_thai === "Đã xác nhận" || don.trang_thai === "Đã hoàn thành";
  const xongHet = don.trang_thai === "Đã hoàn thành";

  return (
    <div className="min-h-screen bg-paper py-10 px-4">
      <div className="max-w-md mx-auto bg-card rounded-2xl shadow-sm border border-line overflow-hidden">
        <div className="bg-paper px-6 py-4 border-b border-line">
          <p className="text-sm text-ink-soft font-medium">Đơn #{don.id}</p>
          <h1 className="text-xl font-bold text-ink">Thợ: {don.tho?.ten ?? "Đang cập nhật"}</h1>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <NhanTrangThai trangThai={don.trang_thai} className="self-start text-sm px-3 py-1.5" />
            {don.trang_thai === "Chờ xác nhận" && don.chinh_sua_luc && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-gold-soft text-gold border border-gold/30">
                <PencilLine className="w-3 h-3" /> Đã chỉnh sửa
              </span>
            )}
          </div>

          {nhac && <NhacDonBoQuen muc={[{ id: don.id, noiDung: nhac }]} />}

          <div className="flex flex-col gap-2 text-sm text-ink-soft">
            <KhoiLichHen gioHen={don.gio_hen} diaChi={don.dia_chi_hen} />

            {don.gio_du_kien_den && (
              <div className="flex items-start gap-2.5 bg-teal-soft p-2.5 rounded-lg border border-teal/20">
                <Car className="w-4 h-4 text-teal mt-0.5 shrink-0" />
                <span className="text-teal font-semibold">
                  Thợ dự kiến đến: {dinhDangGioNgan(don.gio_du_kien_den)}
                </span>
              </div>
            )}

            {don.ghi_chu && (
              <div className="flex items-start gap-2.5 bg-gold-soft p-3 rounded-lg border border-gold/20">
                <StickyNote className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <span className="text-ink-soft italic">{don.ghi_chu}</span>
              </div>
            )}
          </div>

          {/* ---------- CHỜ XÁC NHẬN ---------- */}
          {don.trang_thai === "Chờ xác nhận" && !dangSua && (
            <div className="flex flex-col gap-2 border-t border-line pt-4">
              <p className="text-sm text-ink-soft">
                Đơn đang chờ thợ xác nhận. Quay lại link này sau khi thợ nhận đơn để xác nhận hoàn thành và đánh giá nhé.
              </p>
              {laChuDon && (
                <div className="flex gap-2">
                  <button
                    onClick={moFormSua}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-teal hover:opacity-90 text-white py-2.5 rounded-lg text-sm font-semibold transition"
                  >
                    <PencilLine className="w-4 h-4" /> Sửa đơn
                  </button>
                  <button
                    onClick={huyDon}
                    className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-ink-soft border border-line hover:bg-rust-soft hover:text-rust hover:border-rust/30 py-2.5 rounded-lg transition"
                  >
                    <XCircle className="w-4 h-4" /> Hủy đơn
                  </button>
                </div>
              )}
            </div>
          )}

          {don.trang_thai === "Chờ xác nhận" && dangSua && laChuDon && (
            <div className="flex flex-col gap-3 border-t border-line pt-4">
              <p className="font-semibold text-ink">Sửa thông tin đơn</p>
              <p className="text-xs text-ink-soft -mt-2">
                Chỉ sửa được khi thợ chưa xác nhận. Thợ sẽ thấy đơn có nhãn &ldquo;đã chỉnh sửa&rdquo;.
              </p>

              <label className="flex flex-col gap-1 text-xs font-semibold text-ink-soft">
                Tên của bạn
                <input
                  value={formTen}
                  onChange={(e) => setFormTen(e.target.value)}
                  className="border border-line rounded-lg px-3 py-2 text-sm font-normal text-ink outline-none focus:border-teal bg-card"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-semibold text-ink-soft">
                Số điện thoại
                <input
                  value={formSdt}
                  onChange={(e) => setFormSdt(e.target.value)}
                  inputMode="tel"
                  className="border border-line rounded-lg px-3 py-2 text-sm font-normal text-ink outline-none focus:border-teal bg-card"
                />
              </label>

              {don.che_do_dat_lich !== "ngay_bay_gio" ? (
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold text-ink-soft">Giờ hẹn</p>
                  <ChonKhungGio value={formGio} onChange={setFormGio} thoId={don.tho_id} />
                </div>
              ) : (
                <p className="text-xs text-ink-soft bg-paper border border-line rounded-lg p-2.5">
                  Đơn gọi ngay không đổi giờ hẹn được. Nếu cần hẹn giờ khác, hãy hủy và đặt lại.
                </p>
              )}

              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-ink-soft">Địa chỉ</p>
                <GoiYDiaChi value={formDiaChi} onChange={setFormDiaChi} placeholder="Nhập địa chỉ" />
              </div>

              <label className="flex flex-col gap-1 text-xs font-semibold text-ink-soft">
                Ghi chú
                <textarea
                  value={formGhiChu}
                  onChange={(e) => setFormGhiChu(e.target.value)}
                  rows={2}
                  className="border border-line rounded-lg px-3 py-2 text-sm font-normal text-ink outline-none focus:border-teal bg-card"
                />
              </label>

              <div className="flex gap-2">
                <button
                  onClick={luuSuaDon}
                  disabled={dangLuu}
                  className="flex-1 bg-teal hover:opacity-90 text-white py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 transition"
                >
                  {dangLuu ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <button
                  onClick={() => setDangSua(false)}
                  disabled={dangLuu}
                  className="bg-line hover:bg-ink-soft hover:text-white text-ink-soft px-4 py-2.5 rounded-lg text-sm transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}

          {don.trang_thai === "Đã hủy" && (
            <p className="text-sm text-rust border-t border-line pt-4">Đơn này đã bị hủy.</p>
          )}

          {/* ---------- ĐÃ XÁC NHẬN / ĐÃ HOÀN THÀNH ---------- */}
          {hienThanhHaiBuoc && (
            <div className="flex flex-col gap-3 border-t border-line pt-4">
              <ThanhHaiBuoc
                thoXacNhan={don.tho_xac_nhan_hoan_thanh || xongHet}
                khachXacNhan={don.khach_xac_nhan_hoan_thanh || xongHet}
                vaiTro="khach"
              />

              {don.trang_thai === "Đã xác nhận" && !laChuDon && !don.khach_xac_nhan_hoan_thanh && (
                <p className="text-sm text-ink-soft bg-paper border border-line rounded-lg p-3">
                  Chỉ khách hàng đã đặt đơn này mới xác nhận hoàn thành và đánh giá được — đăng nhập
                  đúng tài khoản đã dùng để đặt lịch nếu đây là đơn của bạn.
                </p>
              )}

              {don.trang_thai === "Đã xác nhận" && laChuDon && !don.khach_xac_nhan_hoan_thanh && (
                <>
                  {!daToiGio ? (
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-2 bg-line text-ink-soft py-3 rounded-lg font-medium cursor-not-allowed"
                    >
                      <Lock className="w-4 h-4" /> Có thể xác nhận hoàn thành từ {nhanMoKhoa(don.gio_hen)}
                    </button>
                  ) : coBaoCao ? (
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-2 bg-line text-ink-soft py-3 rounded-lg font-medium cursor-not-allowed"
                    >
                      <Lock className="w-4 h-4" /> Tạm khóa — đang có báo cáo vấn đề
                    </button>
                  ) : (
                    <button
                      onClick={xacNhanHoanThanh}
                      disabled={dangXacNhan}
                      className="w-full bg-teal hover:opacity-90 text-white py-3 rounded-lg font-medium disabled:opacity-50 transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{dangXacNhan ? "Đang xác nhận..." : "Xác nhận hoàn thành đơn (đã thanh toán)"}</span>
                    </button>
                  )}
                </>
              )}

              {laChuDon && <NutBaoVanDe don={don} onDoiCoBaoCao={setCoBaoCao} />}

              {don.trang_thai === "Đã xác nhận" && laChuDon && (
                <button
                  onClick={huyDon}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-ink-soft border border-line hover:bg-rust-soft hover:text-rust hover:border-rust/30 py-2 rounded-lg transition"
                >
                  <XCircle className="w-3.5 h-3.5" /> Hủy đơn
                </button>
              )}
            </div>
          )}

          {laChuDon && don.khach_xac_nhan_hoan_thanh && !daGuiDanhGia && (
            <div className="space-y-3 border-t border-line pt-4">
              <p className="font-medium text-ink">Bạn chấm mấy sao cho thợ?</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((sao) => (
                  <button
                    key={sao}
                    onClick={() => setSoSao(sao)}
                    className={`transition-colors ${sao <= soSao ? "text-gold" : "text-line"}`}
                  >
                    <Star className="w-8 h-8" fill={sao <= soSao ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
              <textarea
                value={binhLuan}
                onChange={(e) => setBinhLuan(e.target.value)}
                placeholder="Nhận xét (không bắt buộc)"
                className="w-full border border-line rounded-lg p-2 outline-none focus:border-teal"
                rows={2}
              />
              <button
                onClick={guiDanhGia}
                disabled={soSao === 0 || dangGui}
                className="w-full bg-teal hover:opacity-90 text-white py-3 rounded-lg font-medium disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{dangGui ? "Đang gửi..." : "Gửi đánh giá"}</span>
              </button>
            </div>
          )}

          {daGuiDanhGia && (
            <p className="text-teal font-medium border-t border-line pt-4">Cảm ơn bạn đã đánh giá!</p>
          )}
        </div>
      </div>
    </div>
  );
}