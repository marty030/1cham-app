"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useThongBao } from "../../components/ThongBao";
import { dichLoiSupabase } from "../../lib/dichLoi";
import { TUY_CHON_GIO_VN } from "../../lib/thoiGianVN";
import { ghiNhanDongY } from "../../lib/dongYPhapLy";
import {
  taiAnhXacMinh,
  xoaMoiAnhXacMinh,
  NHAN_TRANG_THAI_DUYET,
  type TrangThaiDuyet,
} from "../../lib/xacMinhTho";
import { Camera, CheckCircle2, Hourglass, AlertTriangle, Lock, ShieldCheck, X } from "lucide-react";

type ThoCuaToi = {
  id: number;
  ten: string;
  trang_thai_duyet: TrangThaiDuyet;
  da_xac_minh_danh_tinh: boolean;
  co_chung_chi_nghe: boolean;
};

type HoSoXacMinh = {
  ghi_chu_admin: string | null;
  nop_luc: string | null;
  duyet_luc: string | null;
};

// Một ô chọn ảnh có xem trước. Ảnh chỉ nằm trên máy cho tới khi bấm "Nộp hồ sơ".
function OChonAnh({
  nhan,
  huongDan,
  batBuoc,
  toiDa,
  files,
  onDoi,
  loi,
}: {
  nhan: string;
  huongDan?: string;
  batBuoc?: boolean;
  toiDa: number;
  files: File[];
  onDoi: (files: File[]) => void;
  loi?: boolean;
}) {
  const [xem, setXem] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setXem(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  function chon(e: React.ChangeEvent<HTMLInputElement>) {
    const moi = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (moi.length === 0) return;
    onDoi(toiDa === 1 ? [moi[0]] : [...files, ...moi].slice(0, toiDa));
  }

  const duAnh = files.length >= toiDa;

  return (
    <div className={`flex flex-col gap-2 ${loi ? "ring-1 ring-rust rounded-lg p-2 -m-2" : ""}`}>
      <p className="text-sm font-semibold text-ink">
        {nhan} {batBuoc && <span className="text-rust">*</span>}
        {toiDa > 1 && <span className="text-ink-soft font-normal"> (tối đa {toiDa} ảnh)</span>}
      </p>
      {huongDan && <p className="text-xs text-ink-soft -mt-1">{huongDan}</p>}

      {xem.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {xem.map((url, i) => (
            <div key={url} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`${nhan} ${i + 1}`} className="h-20 w-20 object-cover rounded-lg border border-line" />
              <button
                type="button"
                onClick={() => onDoi(files.filter((_, idx) => idx !== i))}
                className="absolute -top-1.5 -right-1.5 bg-rust text-white rounded-full p-0.5"
                aria-label="Bỏ ảnh này"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {!duAnh && (
        <label className="self-start cursor-pointer inline-flex items-center gap-1.5 text-sm font-semibold text-teal border border-teal/30 bg-teal-soft hover:opacity-80 px-3 py-2 rounded-lg transition">
          <Camera className="w-4 h-4" />
          {files.length === 0 ? "Chọn ảnh" : "Thêm ảnh"}
          <input type="file" accept="image/*" multiple={toiDa > 1} onChange={chon} className="hidden" />
        </label>
      )}
    </div>
  );
}

export default function XacMinhTho() {
  const router = useRouter();
  const thongBao = useThongBao();

  const [dangTai, setDangTai] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [tho, setTho] = useState<ThoCuaToi | null>(null);
  const [hoSo, setHoSo] = useState<HoSoXacMinh | null>(null);

  const [cccdTruoc, setCccdTruoc] = useState<File[]>([]);
  const [cccdSau, setCccdSau] = useState<File[]>([]);
  const [chanDung, setChanDung] = useState<File[]>([]);
  const [chungChi, setChungChi] = useState<File[]>([]);
  const [congViec, setCongViec] = useState<File[]>([]);
  const [gioiThieu, setGioiThieu] = useState("");
  const [kinhNghiem, setKinhNghiem] = useState("");
  const [dongY, setDongY] = useState(false);
  const [daCham, setDaCham] = useState(false);
  const [dangNop, setDangNop] = useState(false);
  const [tienDo, setTienDo] = useState("");

  async function taiTrangThai() {
    const { data: sess } = await supabase.auth.getSession();
    const user = sess.session?.user;
    if (!user) {
      router.push("/login?next=%2Fxac-minh");
      return;
    }
    setUserId(user.id);

    const { data: thoData } = await supabase
      .from("tho")
      .select("id, ten, trang_thai_duyet, da_xac_minh_danh_tinh, co_chung_chi_nghe")
      .eq("user_id", user.id)
      .limit(1);
    const t = (thoData?.[0] ?? null) as ThoCuaToi | null;
    setTho(t);

    if (t) {
      const { data: h } = await supabase
        .from("ho_so_xac_minh")
        .select("ghi_chu_admin, nop_luc, duyet_luc")
        .eq("tho_id", t.id)
        .limit(1);
      setHoSo((h?.[0] ?? null) as HoSoXacMinh | null);
    }
    setDangTai(false);
  }

  useEffect(() => {
    taiTrangThai();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function xoaForm() {
    setCccdTruoc([]);
    setCccdSau([]);
    setChanDung([]);
    setChungChi([]);
    setCongViec([]);
    setGioiThieu("");
    setKinhNghiem("");
    setDongY(false);
    setDaCham(false);
  }

  async function nopHoSo() {
    if (!userId) return;
    setDaCham(true);

    if (cccdTruoc.length === 0 || cccdSau.length === 0 || chanDung.length === 0) {
      thongBao("Cần đủ 3 ảnh bắt buộc: CCCD mặt trước, CCCD mặt sau và ảnh chân dung.", "canhbao");
      return;
    }
    if (congViec.length === 0 && !gioiThieu.trim()) {
      thongBao("Cần ít nhất một ảnh công việc đã làm hoặc thông tin người giới thiệu.", "canhbao");
      return;
    }
    if (!dongY) {
      thongBao("Bạn cần đồng ý cho chúng tôi xử lý hồ sơ xác minh để tiếp tục.", "canhbao");
      return;
    }

    setDangNop(true);
    try {
      // 1. Ghi nhận đồng ý TRƯỚC khi nhận bất kỳ ảnh nào
      setTienDo("Đang ghi nhận đồng ý...");
      const { error: loiDongY } = await ghiNhanDongY("tho", ["xac_minh_danh_tinh"]);
      if (loiDongY) throw new Error(dichLoiSupabase(loiDongY.message));

      // 2. Dọn ảnh cũ (nếu từng nộp trước đó)
      setTienDo("Đang dọn ảnh cũ...");
      await xoaMoiAnhXacMinh(userId);

      // 3. Thu nhỏ, bỏ thông tin ẩn trong ảnh rồi tải lên kho riêng
      const tongSoAnh = 3 + chungChi.length + congViec.length;
      let daTai = 0;
      const tai = async (file: File, loai: string, stt = 0) => {
        daTai += 1;
        setTienDo(`Đang tải ảnh lên (${daTai}/${tongSoAnh})...`);
        return taiAnhXacMinh(file, userId, loai, stt);
      };

      const pTruoc = await tai(cccdTruoc[0], "cccd-truoc");
      const pSau = await tai(cccdSau[0], "cccd-sau");
      const pChanDung = await tai(chanDung[0], "chan-dung");
      const pChungChi: string[] = [];
      for (let i = 0; i < chungChi.length; i++) pChungChi.push(await tai(chungChi[i], "chung-chi", i));
      const pCongViec: string[] = [];
      for (let i = 0; i < congViec.length; i++) pCongViec.push(await tai(congViec[i], "cong-viec", i));

      // 4. Nộp hồ sơ
      setTienDo("Đang nộp hồ sơ...");
      const { error } = await supabase.rpc("nop_ho_so_xac_minh", {
        p_anh_cccd_truoc: pTruoc,
        p_anh_cccd_sau: pSau,
        p_anh_chan_dung: pChanDung,
        p_anh_chung_chi: pChungChi,
        p_anh_cong_viec: pCongViec,
        p_gioi_thieu: gioiThieu.trim() || null,
        p_kinh_nghiem: kinhNghiem.trim() || null,
      });
      if (error) throw new Error(dichLoiSupabase(error.message));

      thongBao("Đã nộp hồ sơ xác minh. Chúng tôi sẽ xem xét sớm.", "thanhcong");
      xoaForm();
      await taiTrangThai();
    } catch (loi) {
      // Không để ảnh giấy tờ nằm lại trong kho khi nộp không thành công
      await xoaMoiAnhXacMinh(userId);
      const noiDung = loi instanceof Error ? loi.message : "Có lỗi xảy ra";
      thongBao("Không nộp được hồ sơ: " + dichLoiSupabase(noiDung), "loi");
    } finally {
      setDangNop(false);
      setTienDo("");
    }
  }

  if (dangTai) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rust"></div>
      </div>
    );
  }

  if (!tho) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper p-6">
        <p className="text-ink-soft text-center">Trang này dành cho tài khoản thợ.</p>
      </div>
    );
  }

  const trangThai = tho.trang_thai_duyet;
  const choPhepNop = trangThai === "chua_nop" || trangThai === "can_bo_sung" || trangThai === "tu_choi";
  const thieuAnh = daCham && (cccdTruoc.length === 0 || cccdSau.length === 0 || chanDung.length === 0);
  const thieuNguonUyTin = daCham && congViec.length === 0 && !gioiThieu.trim();

  return (
    <div className="min-h-screen bg-paper py-8 px-4">
      <div className="max-w-md mx-auto flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-teal" /> Xác minh hồ sơ thợ
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            Chỉ thợ đã được duyệt mới hiện công khai cho khách. Trạng thái hiện tại:{" "}
            <span className="font-semibold text-ink">{NHAN_TRANG_THAI_DUYET[trangThai]}</span>
          </p>
        </div>

        {trangThai === "da_duyet" && (
          <div className="bg-teal-soft border border-teal/30 rounded-2xl p-5 flex flex-col gap-2">
            <p className="flex items-center gap-2 font-semibold text-teal">
              <CheckCircle2 className="w-5 h-5" /> Hồ sơ của bạn đã được duyệt
            </p>
            <p className="text-sm text-ink-soft">Bạn đang hiển thị công khai cho khách.</p>
            {(tho.da_xac_minh_danh_tinh || tho.co_chung_chi_nghe) && (
              <ul className="text-sm text-ink-soft list-disc pl-5">
                {tho.da_xac_minh_danh_tinh && <li>Đã xác minh danh tính</li>}
                {tho.co_chung_chi_nghe && <li>Có chứng chỉ nghề</li>}
              </ul>
            )}
            <div className="flex gap-3 text-sm font-semibold mt-1">
              <Link href={`/tho/${tho.id}`} className="text-teal hover:underline">
                Xem trang của tôi →
              </Link>
              <Link href="/ho-so" className="text-ink-soft hover:underline">
                Hồ sơ
              </Link>
            </div>
          </div>
        )}

        {trangThai === "cho_duyet" && (
          <div className="bg-card border border-line rounded-2xl p-5 flex flex-col gap-2">
            <p className="flex items-center gap-2 font-semibold text-ink">
              <Hourglass className="w-5 h-5 text-gold" /> Hồ sơ đang chờ duyệt
            </p>
            <p className="text-sm text-ink-soft">
              {hoSo?.nop_luc
                ? `Bạn đã nộp lúc ${new Date(hoSo.nop_luc).toLocaleString("vi-VN", TUY_CHON_GIO_VN)}. `
                : ""}
              Chúng tôi sẽ xem xét và báo kết quả ngay trên trang này. Khi được duyệt, hồ sơ của bạn sẽ hiện công khai.
            </p>
          </div>
        )}

        {(trangThai === "can_bo_sung" || trangThai === "tu_choi") && (
          <div className="bg-gold-soft border border-gold/30 rounded-2xl p-5 flex flex-col gap-2">
            <p className="flex items-center gap-2 font-semibold text-ink">
              <AlertTriangle className="w-5 h-5 text-gold" />
              {trangThai === "can_bo_sung" ? "Hồ sơ cần bổ sung" : "Hồ sơ chưa được duyệt"}
            </p>
            {hoSo?.ghi_chu_admin && (
              <p className="text-sm text-ink bg-card border border-line rounded-lg px-3 py-2">{hoSo.ghi_chu_admin}</p>
            )}
            <p className="text-sm text-ink-soft">Bạn có thể nộp lại hồ sơ ở biểu mẫu bên dưới.</p>
          </div>
        )}

        {choPhepNop && (
          <>
            <div className="bg-card border border-line rounded-2xl p-5 flex flex-col gap-2">
              <p className="flex items-center gap-2 font-semibold text-ink">
                <Lock className="w-4 h-4 text-teal" /> Ảnh giấy tờ của bạn được xử lý thế nào
              </p>
              <ul className="text-xs text-ink-soft list-disc pl-5 flex flex-col gap-1 leading-relaxed">
                <li>Chỉ quản trị viên xem được, lưu trong kho riêng tư và không bao giờ hiển thị công khai.</li>
                <li>Ảnh bị xóa khỏi hệ thống ngay sau khi hồ sơ được duyệt hoặc bị từ chối. Chỉ giữ lại kết quả xác minh.</li>
                <li>Thông tin ẩn trong ảnh (như vị trí chụp) được loại bỏ trước khi tải lên.</li>
              </ul>
            </div>

            <div className="bg-card border border-line rounded-2xl p-5 flex flex-col gap-5">
              <OChonAnh nhan="CCCD, mặt trước" batBuoc toiDa={1} files={cccdTruoc} onDoi={setCccdTruoc} loi={thieuAnh && cccdTruoc.length === 0} />
              <OChonAnh nhan="CCCD, mặt sau" batBuoc toiDa={1} files={cccdSau} onDoi={setCccdSau} loi={thieuAnh && cccdSau.length === 0} />
              <OChonAnh
                nhan="Ảnh chân dung"
                batBuoc
                toiDa={1}
                files={chanDung}
                onDoi={setChanDung}
                huongDan="Chụp rõ mặt, đủ sáng, không đeo kính râm hay khẩu trang. Nên cầm CCCD cạnh mặt để đối chiếu."
                loi={thieuAnh && chanDung.length === 0}
              />
              <OChonAnh
                nhan="Chứng chỉ / bằng nghề"
                toiDa={3}
                files={chungChi}
                onDoi={setChungChi}
                huongDan="Không bắt buộc. Nếu có sẽ được xét để gắn huy hiệu."
              />
              <OChonAnh
                nhan="Ảnh công việc đã làm"
                toiDa={5}
                files={congViec}
                onDoi={setCongViec}
                huongDan="Cần ít nhất một ảnh công việc, hoặc điền thông tin người giới thiệu bên dưới."
                loi={thieuNguonUyTin}
              />

              <div className={thieuNguonUyTin ? "ring-1 ring-rust rounded-lg p-2 -m-2" : ""}>
                <label className="text-sm font-semibold text-ink block mb-1">Người giới thiệu hoặc đường dẫn giới thiệu</label>
                <textarea
                  value={gioiThieu}
                  onChange={(e) => setGioiThieu(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  placeholder="Link Facebook/Zalo giới thiệu công việc của bạn, hoặc tên và số điện thoại người từng thuê bạn, có thể xác nhận."
                  className="w-full border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-teal bg-card"
                />
                <p className="text-xs text-ink-soft mt-1">Chỉ ghi thông tin của người đã đồng ý cho bạn chia sẻ.</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-ink block mb-1">Kinh nghiệm làm nghề</label>
                <textarea
                  value={kinhNghiem}
                  onChange={(e) => setKinhNghiem(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  placeholder="Bạn làm nghề được bao lâu, từng làm những loại việc gì?"
                  className="w-full border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-teal bg-card"
                />
              </div>

              <label
                className={`flex items-start gap-2.5 text-xs text-ink-soft leading-relaxed rounded-lg border p-3 bg-paper ${
                  daCham && !dongY ? "border-rust" : "border-line"
                }`}
              >
                <input
                  type="checkbox"
                  checked={dongY}
                  onChange={(e) => setDongY(e.target.checked)}
                  className="w-4 h-4 mt-0.5 shrink-0 accent-teal"
                />
                <span>
                  Tôi đồng ý để Thợ Xịn thu thập và xử lý ảnh CCCD, ảnh chân dung, chứng chỉ, ảnh công việc và thông tin giới thiệu
                  tôi nộp ở đây, chỉ nhằm xác minh danh tính và tay nghề. Ảnh bị xóa sau khi hồ sơ được xử lý, chỉ kết quả xác minh
                  được lưu. Nếu tôi ghi thông tin của người giới thiệu thì người đó đã đồng ý.{" "}
                  <a href="/bao-mat" target="_blank" rel="noopener noreferrer" className="text-teal font-semibold underline">
                    Chính sách bảo vệ dữ liệu cá nhân
                  </a>
                </span>
              </label>

              <button
                type="button"
                onClick={nopHoSo}
                disabled={dangNop}
                className="bg-teal hover:opacity-90 text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition"
              >
                {dangNop ? tienDo || "Đang xử lý..." : trangThai === "chua_nop" ? "Nộp hồ sơ xác minh" : "Nộp lại hồ sơ"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}