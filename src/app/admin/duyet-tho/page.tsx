"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { useThongBao, useXacNhan } from "../../../components/ThongBao";
import { dichLoiSupabase } from "../../../lib/dichLoi";
import { TUY_CHON_GIO_VN } from "../../../lib/thoiGianVN";
import { DANH_MUC_NGHE } from "../../../lib/danhMuc";
import {
  KHO_ANH_XAC_MINH,
  NHAN_TRANG_THAI_DUYET,
  xoaMoiAnhXacMinh,
  type TrangThaiDuyet,
} from "../../../lib/xacMinhTho";
import { ShieldCheck, Eye, Trash2, Phone } from "lucide-react";

type ThoRow = {
  id: number;
  ten: string;
  nghe: string | null;
  danh_muc: string[] | null;
  dia_chi: string | null;
  so_dien_thoai: string | null;
  user_id: string | null;
  trang_thai_duyet: TrangThaiDuyet;
  created_at: string;
};

type HoSoRow = {
  tho_id: number;
  anh_cccd_truoc: string | null;
  anh_cccd_sau: string | null;
  anh_chan_dung: string | null;
  anh_chung_chi: string[] | null;
  anh_cong_viec: string[] | null;
  gioi_thieu: string | null;
  kinh_nghiem: string | null;
  nop_luc: string | null;
  ghi_chu_admin: string | null;
  duyet_luc: string | null;
  anh_da_xoa_luc: string | null;
};

type AnhXem = { nhan: string; url: string };

const CAC_TAB: TrangThaiDuyet[] = ["cho_duyet", "can_bo_sung", "tu_choi", "chua_nop", "da_duyet"];

function tenNganh(ma: string) {
  return DANH_MUC_NGHE.find((m) => m.gia_tri === ma)?.nhan ?? ma;
}

export default function DuyetTho() {
  const router = useRouter();
  const thongBao = useThongBao();
  const xacNhanHopThoai = useXacNhan();

  const [laAdmin, setLaAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<TrangThaiDuyet>("cho_duyet");
  const [danhSach, setDanhSach] = useState<ThoRow[]>([]);
  const [hoSoTheoTho, setHoSoTheoTho] = useState<Record<number, HoSoRow>>({});
  const [soTheoTab, setSoTheoTab] = useState<Record<string, number>>({});
  const [anhXem, setAnhXem] = useState<Record<number, AnhXem[]>>({});
  const [ghiChu, setGhiChu] = useState<Record<number, string>>({});
  const [xacMinh, setXacMinh] = useState<Record<number, boolean>>({});
  const [chungChi, setChungChi] = useState<Record<number, boolean>>({});
  const [dangXuLy, setDangXuLy] = useState<number | null>(null);

  useEffect(() => {
    async function kiemTra() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/login?next=%2Fadmin%2Fduyet-tho");
        return;
      }
      setLaAdmin(data.session.user.app_metadata?.role === "admin");
    }
    kiemTra();
  }, [router]);

  const taiDanhSach = useCallback(async () => {
    const { data: dem } = await supabase.from("tho").select("trang_thai_duyet").neq("trang_thai_duyet", "da_duyet");
    const soLuong: Record<string, number> = {};
    for (const dong of dem ?? []) soLuong[dong.trang_thai_duyet] = (soLuong[dong.trang_thai_duyet] ?? 0) + 1;
    setSoTheoTab(soLuong);

    const { data: dsTho, error } = await supabase
      .from("tho")
      .select("id, ten, nghe, danh_muc, dia_chi, so_dien_thoai, user_id, trang_thai_duyet, created_at")
      .eq("trang_thai_duyet", tab)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      thongBao("Lỗi tải danh sách: " + dichLoiSupabase(error.message), "loi");
      return;
    }
    const ds = (dsTho ?? []) as ThoRow[];
    setDanhSach(ds);
    setAnhXem({});

    if (ds.length > 0) {
      const { data: hoSo } = await supabase
        .from("ho_so_xac_minh")
        .select("*")
        .in("tho_id", ds.map((t) => t.id));
      const theoTho: Record<number, HoSoRow> = {};
      for (const h of (hoSo ?? []) as HoSoRow[]) theoTho[h.tho_id] = h;
      setHoSoTheoTho(theoTho);
    } else {
      setHoSoTheoTho({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    if (laAdmin) taiDanhSach();
  }, [laAdmin, taiDanhSach]);

  // Tạo liên kết xem ảnh có hạn 10 phút; chỉ tạo khi admin bấm xem
  async function xemAnh(tho: ThoRow) {
    const h = hoSoTheoTho[tho.id];
    if (!h) return;
    const muc: { nhan: string; path: string | null }[] = [
      { nhan: "CCCD mặt trước", path: h.anh_cccd_truoc },
      { nhan: "CCCD mặt sau", path: h.anh_cccd_sau },
      { nhan: "Ảnh chân dung", path: h.anh_chan_dung },
      ...(h.anh_chung_chi ?? []).map((p, i) => ({ nhan: `Chứng chỉ ${i + 1}`, path: p as string | null })),
      ...(h.anh_cong_viec ?? []).map((p, i) => ({ nhan: `Công việc ${i + 1}`, path: p as string | null })),
    ].filter((m) => !!m.path);

    if (muc.length === 0) {
      thongBao("Hồ sơ này không còn ảnh (đã bị xóa).", "thongtin");
      return;
    }
    const { data, error } = await supabase.storage
      .from(KHO_ANH_XAC_MINH)
      .createSignedUrls(muc.map((m) => m.path as string), 600);
    if (error || !data) {
      thongBao("Không tạo được liên kết xem ảnh: " + dichLoiSupabase(error?.message), "loi");
      return;
    }
    setAnhXem((truoc) => ({
      ...truoc,
      [tho.id]: data.map((d, i) => ({ nhan: muc[i].nhan, url: d.signedUrl ?? "" })).filter((a) => a.url),
    }));
  }

  async function xoaAnhVaGhiNhan(tho: ThoRow): Promise<boolean> {
    if (!tho.user_id) return true;
    const kq = await xoaMoiAnhXacMinh(tho.user_id);
    if (!kq.thanhCong) return false;
    const { error } = await supabase.rpc("admin_ghi_nhan_xoa_anh", { p_tho_id: tho.id });
    return !error;
  }

  async function quyetDinh(tho: ThoRow, loai: "duyet" | "can_bo_sung" | "tu_choi") {
    const ghi = (ghiChu[tho.id] ?? "").trim();
    if (loai !== "duyet" && !ghi) {
      thongBao("Hãy ghi lý do hoặc nội dung cần bổ sung để thợ biết.", "canhbao");
      return;
    }
    const cauHoi =
      loai === "duyet"
        ? `Duyệt thợ "${tho.ten}"? Thợ sẽ hiện công khai và ảnh giấy tờ sẽ bị xóa khỏi hệ thống.`
        : loai === "tu_choi"
        ? `Từ chối thợ "${tho.ten}"? Ảnh giấy tờ sẽ bị xóa khỏi hệ thống.`
        : `Yêu cầu thợ "${tho.ten}" bổ sung hồ sơ? Ảnh hiện tại được giữ lại cho tới khi có quyết định cuối.`;
    if (!(await xacNhanHopThoai(cauHoi))) return;

    setDangXuLy(tho.id);
    const { error } = await supabase.rpc("admin_duyet_tho", {
      p_tho_id: tho.id,
      p_quyet_dinh: loai,
      p_ghi_chu: ghi || null,
      p_xac_minh_danh_tinh: !!xacMinh[tho.id],
      p_co_chung_chi: !!chungChi[tho.id],
    });
    if (error) {
      setDangXuLy(null);
      thongBao("Lỗi: " + dichLoiSupabase(error.message), "loi");
      return;
    }

    if (loai === "can_bo_sung") {
      thongBao("Đã yêu cầu thợ bổ sung hồ sơ.", "thanhcong");
    } else if (await xoaAnhVaGhiNhan(tho)) {
      thongBao(loai === "duyet" ? "Đã duyệt thợ và xóa ảnh giấy tờ." : "Đã từ chối và xóa ảnh giấy tờ.", "thanhcong");
    } else {
      thongBao(
        "Đã lưu quyết định nhưng CHƯA xóa được ảnh giấy tờ. Mở thẻ hồ sơ ở tab tương ứng và bấm “Xóa ảnh ngay”.",
        "canhbao"
      );
    }
    setDangXuLy(null);
    await taiDanhSach();
  }

  async function xoaAnhNgay(tho: ThoRow) {
    if (!(await xacNhanHopThoai(`Xóa toàn bộ ảnh giấy tờ của "${tho.ten}" khỏi hệ thống?`))) return;
    setDangXuLy(tho.id);
    const ok = await xoaAnhVaGhiNhan(tho);
    setDangXuLy(null);
    thongBao(ok ? "Đã xóa ảnh giấy tờ." : "Vẫn chưa xóa được ảnh, thử lại hoặc xóa trong Supabase Storage.", ok ? "thanhcong" : "loi");
    await taiDanhSach();
  }

  if (laAdmin === null) return <p className="p-8 text-ink-soft">Đang kiểm tra đăng nhập...</p>;
  if (!laAdmin) return <p className="p-8 text-ink-soft">Trang này chỉ dành cho quản trị viên.</p>;

  return (
    <div className="min-h-screen bg-paper p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-5 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6" /> Duyệt thợ
        </h1>

        <div className="flex flex-wrap gap-2 mb-6">
          {CAC_TAB.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                tab === t ? "bg-rust text-white" : "bg-card border border-line text-ink-soft hover:bg-line"
              }`}
            >
              {NHAN_TRANG_THAI_DUYET[t]}
              {t !== "da_duyet" && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${tab === t ? "bg-white/25" : "bg-line"}`}>
                  {soTheoTab[t] ?? 0}
                </span>
              )}
            </button>
          ))}
        </div>

        {danhSach.length === 0 && (
          <div className="bg-card border border-line rounded-2xl p-10 text-center text-ink-soft">
            Không có thợ nào ở trạng thái này.
          </div>
        )}

        <div className="flex flex-col gap-4">
          {danhSach.map((tho) => {
            const h = hoSoTheoTho[tho.id];
            const conAnh =
              !!h &&
              !!(h.anh_cccd_truoc || h.anh_cccd_sau || h.anh_chan_dung || h.anh_chung_chi?.length || h.anh_cong_viec?.length);
            const anhChuaXoa = !!h && !!h.duyet_luc && !h.anh_da_xoa_luc && conAnh && tho.trang_thai_duyet !== "can_bo_sung";
            const dangLam = dangXuLy === tho.id;
            return (
              <div key={tho.id} className="bg-card border border-line rounded-2xl p-5 flex flex-col gap-3 text-sm text-ink-soft">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold text-ink">{tho.ten}</p>
                    <p>{tho.nghe || "—"}</p>
                  </div>
                  {tho.so_dien_thoai && (
                    <a
                      href={`tel:${tho.so_dien_thoai}`}
                      className="flex items-center gap-1.5 text-teal font-semibold bg-teal-soft px-3 py-1.5 rounded-lg shrink-0"
                    >
                      <Phone className="w-4 h-4" /> {tho.so_dien_thoai}
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(tho.danh_muc ?? []).map((m) => (
                    <span key={m} className="bg-paper border border-line text-xs px-2.5 py-1 rounded-full">
                      {tenNganh(m)}
                    </span>
                  ))}
                </div>
                <p>
                  <span className="font-semibold text-ink">Địa chỉ:</span> {tho.dia_chi || "—"}
                </p>
                <p>
                  <span className="font-semibold text-ink">Đăng ký lúc:</span>{" "}
                  {new Date(tho.created_at).toLocaleString("vi-VN", TUY_CHON_GIO_VN)}
                </p>

                {h ? (
                  <div className="bg-paper border border-line rounded-xl p-3 flex flex-col gap-1.5">
                    {h.nop_luc && (
                      <p>
                        <span className="font-semibold text-ink">Nộp hồ sơ lúc:</span>{" "}
                        {new Date(h.nop_luc).toLocaleString("vi-VN", TUY_CHON_GIO_VN)}
                      </p>
                    )}
                    <p>
                      <span className="font-semibold text-ink">Kinh nghiệm:</span> {h.kinh_nghiem || "—"}
                    </p>
                    <p className="whitespace-pre-wrap">
                      <span className="font-semibold text-ink">Giới thiệu:</span> {h.gioi_thieu || "—"}
                    </p>
                    {h.ghi_chu_admin && (
                      <p>
                        <span className="font-semibold text-ink">Ghi chú đã gửi thợ:</span> {h.ghi_chu_admin}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="italic">Chưa có hồ sơ xác minh (thợ cũ hoặc chưa nộp).</p>
                )}

                {anhChuaXoa && (
                  <div className="bg-rust-soft border border-rust/30 rounded-xl p-3 flex items-center justify-between gap-3">
                    <p className="text-rust font-semibold">Ảnh giấy tờ chưa được xóa khỏi hệ thống.</p>
                    <button
                      onClick={() => xoaAnhNgay(tho)}
                      disabled={dangLam}
                      className="flex items-center gap-1.5 bg-rust text-white px-3 py-1.5 rounded-lg font-semibold disabled:opacity-50 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" /> Xóa ảnh ngay
                    </button>
                  </div>
                )}

                {conAnh && !anhXem[tho.id] && (
                  <button
                    onClick={() => xemAnh(tho)}
                    className="self-start flex items-center gap-1.5 text-sm font-semibold text-teal border border-teal/30 bg-teal-soft px-3 py-2 rounded-lg hover:opacity-80"
                  >
                    <Eye className="w-4 h-4" /> Xem ảnh hồ sơ (liên kết có hạn 10 phút)
                  </button>
                )}

                {anhXem[tho.id] && (
                  <div className="flex flex-wrap gap-3">
                    {anhXem[tho.id].map((a) => (
                      <a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="flex flex-col gap-1 text-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={a.url} alt={a.nhan} className="h-28 w-28 object-cover rounded-lg border border-line" />
                        <span className="text-center">{a.nhan}</span>
                      </a>
                    ))}
                  </div>
                )}

                {tho.trang_thai_duyet === "cho_duyet" && (
                  <div className="border-t border-line pt-3 flex flex-col gap-2.5">
                    <label className="flex items-center gap-2 text-ink">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-teal"
                        checked={!!xacMinh[tho.id]}
                        onChange={(e) => setXacMinh((t) => ({ ...t, [tho.id]: e.target.checked }))}
                      />
                      Đã đối chiếu danh tính (hiện huy hiệu “Đã xác minh danh tính”)
                    </label>
                    <label className="flex items-center gap-2 text-ink">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-teal"
                        checked={!!chungChi[tho.id]}
                        onChange={(e) => setChungChi((t) => ({ ...t, [tho.id]: e.target.checked }))}
                      />
                      Có chứng chỉ nghề hợp lệ (hiện huy hiệu “Có chứng chỉ nghề”)
                    </label>
                    <textarea
                      value={ghiChu[tho.id] ?? ""}
                      onChange={(e) => setGhiChu((t) => ({ ...t, [tho.id]: e.target.value }))}
                      maxLength={500}
                      rows={2}
                      placeholder="Ghi chú gửi thợ (bắt buộc khi từ chối hoặc yêu cầu bổ sung)"
                      className="border border-line rounded-lg px-3 py-2 text-sm text-ink bg-card outline-none focus:border-teal"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => quyetDinh(tho, "duyet")}
                        disabled={dangLam}
                        className="bg-teal hover:opacity-90 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                      >
                        {dangLam ? "Đang xử lý..." : "Duyệt"}
                      </button>
                      <button
                        onClick={() => quyetDinh(tho, "can_bo_sung")}
                        disabled={dangLam}
                        className="bg-gold-soft text-gold border border-gold/40 hover:opacity-90 px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                      >
                        Cần bổ sung
                      </button>
                      <button
                        onClick={() => quyetDinh(tho, "tu_choi")}
                        disabled={dangLam}
                        className="bg-rust-soft text-rust border border-rust/40 hover:opacity-90 px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}