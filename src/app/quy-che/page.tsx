import type { Metadata } from "next";
import Link from "next/link";
import TrangPhapLy, { Muc, P, Ds, KhoiChuQuan } from "../../components/TrangPhapLy";
import { THONG_TIN_DON_VI as T, CAM_KET, CHINH_SACH_PHI } from "../../lib/thongTinDonVi";

export const metadata: Metadata = { title: "Quy chế hoạt động | Thợ Xịn" };

export default function QuyChe() {
  return (
    <TrangPhapLy tieuDe="Quy chế hoạt động" hienTai="/quy-che">
      <P>
        Quy chế này công bố cách {T.tenNenTang} vận hành, các quyền và trách nhiệm của các bên, và cách tiếp nhận, giải quyết phản
        ánh, khiếu nại. Quy chế đi kèm{" "}
        <Link href="/dieu-khoan" className="text-rust hover:underline">Điều khoản sử dụng</Link> và{" "}
        <Link href="/bao-mat" className="text-rust hover:underline">Chính sách bảo vệ dữ liệu cá nhân</Link>.
      </P>

      <Muc so={1} tieuDe="Thông tin chủ quản nền tảng">
        <KhoiChuQuan />
      </Muc>

      <Muc so={2} tieuDe="Mô hình hoạt động">
        <P>
          {T.tenNenTang} là nền tảng trực tuyến kết nối người cần dịch vụ sửa chữa, bảo trì gia dụng (Khách) với thợ (Thợ) tại khu vực
          hoạt động của Thợ. Nền tảng không bán hàng hóa, không cung cấp dịch vụ sửa chữa, không giữ tiền của các bên.
        </P>
      </Muc>

      <Muc so={3} tieuDe="Các bên và điều kiện tham gia">
        <Ds>
          <li>Khách và Thợ đều phải từ đủ 18 tuổi, có năng lực hành vi dân sự đầy đủ, đăng ký bằng số điện thoại và thông tin trung thực.</li>
          <li>
            Thợ khai báo nghề, ngành, địa chỉ, khu vực hoạt động. Quản trị viên có thể ẩn hồ sơ Thợ khi thông tin không đúng hoặc có vi
            phạm. Nền tảng sẽ thực hiện xác thực điện tử danh tính người bán theo lộ trình pháp luật quy định (từ 01/01/2027).
          </li>
          <li>Quyền và nghĩa vụ chi tiết của từng bên nằm trong Điều khoản sử dụng, Điều 7 và 8.</li>
        </Ds>
      </Muc>

      <Muc so={4} tieuDe="Quy trình giao dịch">
        <Ds>
          <li>Khách chọn Thợ, đặt giờ hẹn hoặc gọi ngay; đơn ở trạng thái &ldquo;Chờ xác nhận&rdquo;.</li>
          <li>Thợ xác nhận hoặc từ chối. Các đơn chờ trùng khung 30 phút với đơn Thợ vừa xác nhận tự động bị hủy kèm lý do.</li>
          <li>Hai bên thỏa thuận giá và thực hiện công việc, trao đổi qua tin nhắn nếu cần.</li>
          <li>Từ giờ hẹn, cả hai bên xác nhận hoàn thành; Khách có thể đánh giá Thợ.</li>
          <li>Mọi trạng thái và mốc thời gian được hệ thống ghi lại.</li>
        </Ds>
      </Muc>

      <Muc so={5} tieuDe="Giá, phí và thanh toán">
        <Ds>
          <li>{CHINH_SACH_PHI}</li>
          <li>Giá dịch vụ do Thợ và Khách thỏa thuận trực tiếp. Thanh toán diễn ra trực tiếp giữa hai bên; Nền tảng không nhận, giữ hay hoàn tiền.</li>
          <li>Thợ tự thực hiện nghĩa vụ thuế đối với thu nhập của mình.</li>
        </Ds>
      </Muc>

      <Muc so={6} tieuDe="Quản lý thông tin và kiểm soát nội dung">
        <Ds>
          <li>Nền tảng lưu thông tin đăng ký của Thợ và Khách, bảo vệ theo Chính sách bảo vệ dữ liệu cá nhân.</li>
          <li>Đánh giá chỉ được gửi bởi Khách của đơn đã hoàn thành. Đánh giá, nội dung vi phạm có thể bị ẩn.</li>
          <li>
            Quản trị viên xem xét báo cáo vấn đề và áp dụng biện pháp: nhắc nhở, ẩn nội dung, hủy đơn do vi phạm, ẩn hồ sơ, tạm khóa
            hoặc chấm dứt tài khoản. Lý do hủy đơn do vi phạm được hiển thị cho cả hai bên của đơn.
          </li>
          <li>Quá trình xử lý được lưu lại để người liên quan có thể theo dõi kết quả và để cung cấp cho cơ quan có thẩm quyền khi được yêu cầu hợp pháp.</li>
        </Ds>
      </Muc>

      <Muc so={7} tieuDe="Tiếp nhận và giải quyết phản ánh, khiếu nại">
        <Ds>
          <li>
            <strong>Kênh tiếp nhận:</strong> tính năng &ldquo;Báo vấn đề&rdquo; trên đơn (dành cho đơn đã xác nhận hoặc trong 7 ngày sau khi
            hoàn thành); điện thoại / Zalo {T.soDienThoai}; email {T.email}.
          </li>
          <li>
            <strong>Bước 1, tiếp nhận:</strong> ghi nhận nội dung, đơn liên quan, thông tin liên hệ. Phản hồi đầu tiên trong{" "}
            {CAM_KET.phanHoiKhieuNaiNgayLamViec} ngày làm việc.
          </li>
          <li>
            <strong>Bước 2, xác minh:</strong> thu thập thông tin từ cả hai bên, đối chiếu mốc thời gian, tin nhắn và đánh giá liên quan.
          </li>
          <li>
            <strong>Bước 3, xử lý:</strong> đề xuất phương án thương lượng giữa hai bên và áp dụng biện pháp theo mục 6 nếu có vi phạm. Thời
            hạn giải quyết thông thường tối đa {CAM_KET.giaiQuyetKhieuNaiNgay} ngày kể từ khi tiếp nhận đủ thông tin; vụ việc phức tạp có thể
            lâu hơn và chúng tôi sẽ thông báo lý do.
          </li>
          <li>
            <strong>Bước 4, thông báo kết quả:</strong> gửi kết quả cho người khiếu nại và bên liên quan; lưu hồ sơ.
          </li>
          <li>
            Nếu không đồng ý với kết quả, bạn có quyền yêu cầu thương lượng lại, nhờ cơ quan quản lý nhà nước hoặc tổ chức xã hội bảo vệ
            quyền lợi người tiêu dùng hỗ trợ, hoặc khởi kiện tại Tòa án có thẩm quyền.
          </li>
        </Ds>
        <P>
          Nền tảng hỗ trợ làm rõ sự việc và kết nối hai bên, nhưng việc bồi thường thiệt hại thuộc trách nhiệm của bên có lỗi, trừ khi
          pháp luật quy định Nền tảng cùng chịu trách nhiệm.
        </P>
      </Muc>

      <Muc so={8} tieuDe="Bảo vệ người tiêu dùng và dữ liệu cá nhân">
        <P>
          Chúng tôi công khai thông tin về chủ quản, giá và thanh toán, quyền và nghĩa vụ của các bên, cách khiếu nại, và chính sách
          bảo vệ dữ liệu cá nhân tại các trang pháp lý này, bằng tiếng Việt. Xem{" "}
          <Link href="/bao-mat" className="text-rust hover:underline">Chính sách bảo vệ dữ liệu cá nhân</Link>.
        </P>
      </Muc>

      <Muc so={9} tieuDe="Hợp tác với cơ quan nhà nước">
        <P>
          Nền tảng phối hợp với cơ quan nhà nước có thẩm quyền trong việc ngăn chặn, gỡ bỏ thông tin hoặc xử lý hành vi vi phạm, và cung
          cấp thông tin người dùng khi có yêu cầu hợp pháp bằng văn bản.
        </P>
      </Muc>

      <Muc so={10} tieuDe="Sửa đổi Quy chế">
        <P>
          Quy chế có thể được sửa đổi để phù hợp với hoạt động và quy định pháp luật. Bản mới được công bố trên Nền tảng kèm ngày cập nhật
          và có hiệu lực từ thời điểm công bố, trừ khi bản đó ghi thời điểm khác.
        </P>
      </Muc>
    </TrangPhapLy>
  );
}