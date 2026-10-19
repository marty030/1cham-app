import type { Metadata } from "next";
import Link from "next/link";
import TrangPhapLy, { Muc, P, Ds, KhoiChuQuan } from "../../components/TrangPhapLy";
import { THONG_TIN_DON_VI as T, CAM_KET, CHINH_SACH_PHI } from "../../lib/thongTinDonVi";

export const metadata: Metadata = { title: "Điều khoản sử dụng | Thợ Xịn" };

export default function DieuKhoan() {
  return (
    <TrangPhapLy tieuDe="Điều khoản sử dụng" hienTai="/dieu-khoan">
      <P>
        Khi tạo tài khoản hoặc sử dụng {T.tenNenTang} ({T.tenMien}), bạn đồng ý với Điều khoản sử dụng này, cùng{" "}
        <Link href="/bao-mat" className="text-rust hover:underline">Chính sách bảo vệ dữ liệu cá nhân</Link> và{" "}
        <Link href="/quy-che" className="text-rust hover:underline">Quy chế hoạt động</Link>. Nếu không đồng ý,
        vui lòng không sử dụng Nền tảng.
      </P>

      <Muc so={1} tieuDe="Đơn vị vận hành">
        <KhoiChuQuan />
      </Muc>

      <Muc so={2} tieuDe="Nền tảng là gì và không là gì">
        <Ds>
          <li>Nền tảng là nơi Khách tìm Thợ sửa chữa, bảo trì gia dụng, đặt lịch, trao đổi, xác nhận hoàn thành và đánh giá.</li>
          <li>
            Dịch vụ sửa chữa do Thợ cung cấp. Nội dung công việc, giá và bảo hành được thỏa thuận trực tiếp giữa Khách và
            Thợ. Nền tảng không phải là bên cung cấp dịch vụ, không phải người sử dụng lao động hay đại lý của Thợ.
          </li>
          <li>
            Nền tảng không nhận, giữ hay chuyển tiền thay cho các bên. Việc thanh toán diễn ra trực tiếp giữa Khách và
            Thợ. Nút &ldquo;xác nhận hoàn thành&rdquo; chỉ là xác nhận của mỗi bên, không phải chứng từ thanh toán.
          </li>
          <li>
            Nền tảng không bảo đảm giá và chất lượng công việc của Thợ, nhưng áp dụng các biện pháp ở Điều 5, 9 và 10 để
            giảm rủi ro cho các bên.
          </li>
        </Ds>
      </Muc>

      <Muc so={3} tieuDe="Điều kiện sử dụng">
        <Ds>
          <li>Bạn phải từ đủ 18 tuổi và có năng lực hành vi dân sự đầy đủ. Nền tảng không dành cho người chưa đủ 18 tuổi.</li>
          <li>Mỗi số điện thoại chỉ được đăng ký một tài khoản. Thông tin đăng ký phải trung thực và được cập nhật khi thay đổi.</li>
          <li>
            Thợ phải có khả năng hành nghề hợp pháp, và tuân thủ điều kiện, giấy phép riêng của ngành nghề nếu pháp luật
            có yêu cầu.
          </li>
        </Ds>
      </Muc>

      <Muc so={4} tieuDe="Tài khoản và bảo mật">
        <Ds>
          <li>Bạn đăng nhập bằng số điện thoại và mật khẩu. Hãy giữ kín mật khẩu; bạn chịu trách nhiệm về hoạt động trên tài khoản của mình.</li>
          <li>
            Hiện Nền tảng chưa xác thực số điện thoại bằng mã OTP. Bạn cam kết số điện thoại đăng ký là của chính mình
            hoặc bạn được chủ số cho phép sử dụng.
          </li>
          <li>Nếu nghi ngờ tài khoản bị lộ hoặc quên mật khẩu, hãy liên hệ hỗ trợ ngay để được xác minh và xử lý.</li>
        </Ds>
      </Muc>

      <Muc so={5} tieuDe="Đặt lịch và vòng đời của một đơn">
        <Ds>
          <li>Khách tạo đơn bằng cách đặt giờ hẹn hoặc bấm &ldquo;Gọi ngay&rdquo; (đơn vẫn được tạo, sau đó thiết bị mở cuộc gọi tới Thợ). Đơn mới ở trạng thái &ldquo;Chờ xác nhận&rdquo;.</li>
          <li>Khi đơn còn &ldquo;Chờ xác nhận&rdquo;, Khách có thể sửa thông tin hoặc hủy; Thợ có thể xác nhận hoặc từ chối.</li>
          <li>
            Khi Thợ xác nhận một đơn đặt giờ hẹn, các đơn khác của cùng Thợ đang chờ xác nhận và trùng khung 30 phút sẽ tự động
            bị hủy, kèm lý do hiển thị cho Khách.
          </li>
          <li>Sau khi Thợ đã xác nhận, mỗi bên vẫn có thể hủy đơn nhưng nên báo trước cho bên kia vì họ đã sắp xếp lịch.</li>
          <li>
            Từ giờ hẹn, cả hai bên cùng bấm xác nhận hoàn thành. Việc xác nhận không thể rút lại. Đơn chỉ chuyển sang
            &ldquo;Đã hoàn thành&rdquo; khi cả hai đã xác nhận, và chỉ khi đó mới được tính vào số đơn và điểm uy tín của Thợ.
          </li>
          <li>Đơn đã hoàn thành không thể đổi trạng thái, trừ trường hợp Nền tảng hủy đơn do vi phạm theo Điều 10.</li>
        </Ds>
      </Muc>

      <Muc so={6} tieuDe="Giá và thanh toán">
        <Ds>
          <li>{CHINH_SACH_PHI}</li>
          <li>Thợ báo giá trực tiếp cho Khách. Hai bên nên thống nhất giá trước khi làm và có thể lưu trao đổi trong phần tin nhắn của Nền tảng.</li>
          <li>Thợ không được yêu cầu khoản tiền ngoài phạm vi đã thỏa thuận mà không có sự đồng ý của Khách.</li>
        </Ds>
      </Muc>

      <Muc so={7} tieuDe="Quyền và nghĩa vụ của Khách">
        <Ds>
          <li>Cung cấp đúng thông tin liên hệ và địa chỉ; có mặt đúng hẹn; thanh toán đúng thỏa thuận; tôn trọng Thợ.</li>
          <li>Chỉ xác nhận hoàn thành khi công việc đã xong; đánh giá trung thực dựa trên trải nghiệm thật.</li>
          <li>Được xem thông tin công khai của Thợ, sửa hoặc hủy đơn theo Điều 5, báo vấn đề và khiếu nại theo Điều 10 và Quy chế hoạt động.</li>
        </Ds>
      </Muc>

      <Muc so={8} tieuDe="Quyền và nghĩa vụ của Thợ">
        <Ds>
          <li>Thợ là cá nhân hoặc đơn vị hoạt động độc lập, tự chịu trách nhiệm về chất lượng, an toàn lao động, bảo hành và bồi thường thiệt hại do lỗi của mình gây ra.</li>
          <li>
            Thợ tự thực hiện nghĩa vụ thuế đối với thu nhập từ công việc (Nền tảng không có chức năng thanh toán nên không
            khấu trừ hay nộp thuế thay), và cung cấp thông tin định danh, thông tin kinh doanh khi pháp luật yêu cầu.
            Nền tảng sẽ thực hiện xác thực điện tử danh tính người bán theo lộ trình pháp luật quy định.
          </li>
          <li>
            Thợ hiểu và đồng ý rằng các thông tin sau được hiển thị công khai: tên, nghề, ngành, địa chỉ, vị trí trung tâm và
            bán kính khu vực hoạt động, ảnh đại diện, số đơn hoàn thành, điểm đánh giá, trạng thái nghỉ hoặc bận. Số điện
            thoại chỉ hiển thị cho người dùng đã đăng nhập.
          </li>
          <li>Thợ cập nhật trạng thái &ldquo;đang nghỉ&rdquo; khi không nhận việc, và phản hồi đơn kịp thời, trung thực.</li>
        </Ds>
      </Muc>

      <Muc so={9} tieuDe="Hành vi bị cấm">
        <Ds>
          <li>Cung cấp thông tin giả; mạo danh; dùng tài khoản của người khác.</li>
          <li>Đánh giá giả, thông đồng đánh giá, xác nhận hoàn thành khi công việc chưa diễn ra, tạo đơn ảo hoặc đơn nhằm quấy rối.</li>
          <li>Lăng mạ, đe dọa, quấy rối; đăng nội dung vi phạm pháp luật hoặc thuần phong mỹ tục.</li>
          <li>Thu thập dữ liệu hàng loạt bằng công cụ tự động, can thiệp trái phép vào hệ thống, khai thác lỗ hổng.</li>
          <li>Lợi dụng Nền tảng để lừa đảo, chiếm đoạt tài sản hoặc thực hiện hành vi trái pháp luật.</li>
        </Ds>
      </Muc>

      <Muc so={10} tieuDe="Đánh giá, báo cáo vấn đề và xử lý vi phạm">
        <Ds>
          <li>Chỉ Khách của một đơn đã hoàn thành mới được đánh giá đơn đó. Đánh giá được hiển thị công khai và tính vào điểm của Thợ.</li>
          <li>
            Thợ hoặc Khách có thể &ldquo;báo vấn đề&rdquo; với đơn đã xác nhận, hoặc trong vòng 7 ngày sau khi đơn hoàn thành.
            Khi còn báo cáo chưa xử lý, đơn không thể được xác nhận hoàn thành. Quản trị viên xem xét và đánh dấu đã xử lý.
          </li>
          <li>
            Tùy mức độ, Nền tảng có thể: nhắc nhở; ẩn đánh giá hoặc nội dung vi phạm; hủy một đơn do vi phạm; ẩn hồ sơ Thợ;
            tạm khóa hoặc chấm dứt tài khoản.
          </li>
          <li>
            Khi hủy một đơn đã hoàn thành do vi phạm, Nền tảng đổi đơn sang &ldquo;Đã hủy&rdquo; kèm lý do hiển thị cho cả Khách và
            Thợ, trừ một đơn hoàn thành khỏi số đơn của Thợ, ẩn đánh giá của đơn đó (dữ liệu vẫn được lưu để đối chiếu) và
            tính lại điểm đánh giá.
          </li>
          <li>Các thời điểm quan trọng của đơn (tạo, xác nhận, hoàn thành, hủy) và các báo cáo được lưu lại để phục vụ giải quyết khiếu nại.</li>
        </Ds>
      </Muc>

      <Muc so={11} tieuDe="Trách nhiệm của Nền tảng">
        <Ds>
          <li>Chúng tôi nỗ lực duy trì Nền tảng hoạt động ổn định nhưng không bảo đảm không gián đoạn; có thể tạm ngừng để bảo trì hoặc nâng cấp.</li>
          <li>
            Chúng tôi không chịu trách nhiệm về thiệt hại phát sinh trực tiếp từ việc thực hiện dịch vụ giữa Khách và Thợ,
            trừ trường hợp pháp luật có quy định khác. Trong đó, nếu Nền tảng biết hoặc phải biết về hành vi vi phạm mà không
            áp dụng biện pháp ngăn chặn kịp thời, chúng tôi có thể phải chịu trách nhiệm theo pháp luật về bảo vệ quyền lợi
            người tiêu dùng.
          </li>
          <li>Không điều khoản nào trong tài liệu này loại trừ hoặc hạn chế các quyền mà pháp luật dành cho người tiêu dùng.</li>
        </Ds>
      </Muc>

      <Muc so={12} tieuDe="Sở hữu trí tuệ và nội dung của bạn">
        <P>
          Giao diện, mã nguồn, thương hiệu {T.tenNenTang} thuộc quyền của đơn vị vận hành. Với nội dung bạn đăng (đánh giá,
          ảnh đại diện, mô tả), bạn giữ quyền sở hữu và cho phép Nền tảng hiển thị, lưu trữ nội dung đó để vận hành dịch vụ.
          Bạn cam đoan nội dung không xâm phạm quyền của người khác.
        </P>
      </Muc>

      <Muc so={13} tieuDe="Tạm khóa và chấm dứt tài khoản">
        <Ds>
          <li>Bạn có thể yêu cầu ngừng sử dụng và xóa dữ liệu theo Chính sách bảo vệ dữ liệu cá nhân.</li>
          <li>Nền tảng có thể tạm khóa hoặc chấm dứt tài khoản vi phạm Điều khoản, và sẽ thông báo lý do cho bạn trừ khi pháp luật không cho phép.</li>
          <li>Các đơn đang thực hiện vào thời điểm tài khoản bị khóa được xử lý theo Quy chế hoạt động để bảo vệ quyền lợi bên còn lại.</li>
        </Ds>
      </Muc>

      <Muc so={14} tieuDe="Khiếu nại và giải quyết tranh chấp">
        <Ds>
          <li>
            Mọi phản ánh, khiếu nại gửi qua {T.soDienThoai} hoặc {T.email}, hoặc tính năng &ldquo;báo vấn đề&rdquo; trên đơn. Chúng tôi
            phản hồi trong {CAM_KET.phanHoiKhieuNaiNgayLamViec} ngày làm việc và cố gắng giải quyết trong {CAM_KET.giaiQuyetKhieuNaiNgay} ngày.
            Chi tiết xem{" "}
            <Link href="/quy-che" className="text-rust hover:underline">Quy chế hoạt động</Link>.
          </li>
          <li>Tranh chấp giữa Khách và Thợ được ưu tiên giải quyết bằng thương lượng; Nền tảng hỗ trợ làm rõ thông tin nhưng không thay thế cơ quan có thẩm quyền.</li>
          <li>Điều khoản này áp dụng pháp luật Việt Nam. Nếu không thương lượng được, tranh chấp có thể được đưa ra cơ quan, tổ chức bảo vệ quyền lợi người tiêu dùng hoặc Tòa án có thẩm quyền tại Việt Nam.</li>
        </Ds>
      </Muc>

      <Muc so={15} tieuDe="Thay đổi Điều khoản">
        <P>
          Chúng tôi có thể cập nhật Điều khoản khi cần. Thay đổi quan trọng sẽ được thông báo trên Nền tảng trước khi áp dụng.
          Việc bạn tiếp tục sử dụng sau thời điểm áp dụng nghĩa là bạn đồng ý với nội dung mới; nếu không đồng ý, bạn có thể
          ngừng sử dụng và yêu cầu xóa dữ liệu.
        </P>
      </Muc>
    </TrangPhapLy>
  );
}