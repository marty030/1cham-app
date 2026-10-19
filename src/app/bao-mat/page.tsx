import type { Metadata } from "next";
import Link from "next/link";
import TrangPhapLy, { Muc, P, Ds, KhoiChuQuan } from "../../components/TrangPhapLy";
import { THONG_TIN_DON_VI as T, CAM_KET } from "../../lib/thongTinDonVi";

export const metadata: Metadata = { title: "Chính sách bảo vệ dữ liệu cá nhân | Thợ Xịn" };

const BANG_DU_LIEU: { nhom: string; duLieu: string; mucDich: string }[] = [
  {
    nhom: "Tài khoản (Khách và Thợ)",
    duLieu: "Số điện thoại, mật khẩu (được mã hóa, chúng tôi không đọc được), tên, loại tài khoản. Một số tài khoản cũ có thêm email do chính người dùng tự nhập; chúng tôi không còn thu email khi đăng ký mới.",
    mucDich: "Tạo và bảo mật tài khoản, đăng nhập, liên hệ hỗ trợ.",
  },
  {
    nhom: "Đơn đặt lịch",
    duLieu: "Tên, số điện thoại, địa chỉ hẹn, giờ hẹn, ghi chú, trạng thái đơn, các mốc thời gian (tạo, xác nhận, hoàn thành, hủy), lý do hủy.",
    mucDich: "Kết nối Khách với Thợ, thực hiện và xác nhận đơn, giải quyết khiếu nại.",
  },
  {
    nhom: "Hồ sơ Thợ",
    duLieu: "Tên, nghề, ngành, địa chỉ, tọa độ trung tâm và bán kính khu vực hoạt động, số điện thoại, ảnh đại diện, số đơn hoàn thành, điểm đánh giá.",
    mucDich: "Hiển thị Thợ cho Khách, tìm thợ theo khu vực, xây dựng uy tín.",
  },
  {
    nhom: "Tin nhắn",
    duLieu: "Nội dung tin nhắn giữa Khách và Thợ, thời điểm gửi, trạng thái đã đọc.",
    mucDich: "Trao đổi công việc, thống nhất giá, làm bằng chứng khi có khiếu nại.",
  },
  {
    nhom: "Đánh giá và báo cáo",
    duLieu: "Số sao, nhận xét, nội dung báo cáo vấn đề, ghi chú xử lý của quản trị viên.",
    mucDich: "Xây dựng uy tín, xử lý vi phạm và khiếu nại.",
  },
  {
    nhom: "Kỹ thuật",
    duLieu: "Phiên đăng nhập lưu trên trình duyệt; nhật ký kỹ thuật của hạ tầng (như địa chỉ IP, thời điểm truy cập).",
    mucDich: "Duy trì đăng nhập, bảo mật, phát hiện lỗi và lạm dụng.",
  },
];

export default function BaoMat() {
  return (
    <TrangPhapLy tieuDe="Chính sách bảo vệ dữ liệu cá nhân" hienTai="/bao-mat">
      <P>
        Chính sách này giải thích {T.tenNenTang} thu thập, sử dụng, chia sẻ và bảo vệ dữ liệu cá nhân của bạn như thế nào,
        theo Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 và Nghị định 356/2025/NĐ-CP (có hiệu lực từ 01/01/2026). Bằng việc
        đánh dấu đồng ý khi đăng ký, bạn xác nhận đã đọc và đồng ý cho chúng tôi xử lý dữ liệu theo Chính sách này.
      </P>

      <Muc so={1} tieuDe="Ai chịu trách nhiệm xử lý dữ liệu">
        <KhoiChuQuan />
      </Muc>

      <Muc so={2} tieuDe="Dữ liệu chúng tôi xử lý và mục đích">
        <div className="overflow-x-auto border border-line rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-paper text-ink text-left">
              <tr>
                <th className="px-3 py-2 font-semibold">Nhóm</th>
                <th className="px-3 py-2 font-semibold">Dữ liệu</th>
                <th className="px-3 py-2 font-semibold">Mục đích</th>
              </tr>
            </thead>
            <tbody className="text-ink-soft align-top">
              {BANG_DU_LIEU.map((dong) => (
                <tr key={dong.nhom} className="border-t border-line">
                  <td className="px-3 py-2 font-semibold text-ink">{dong.nhom}</td>
                  <td className="px-3 py-2">{dong.duLieu}</td>
                  <td className="px-3 py-2">{dong.mucDich}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P>Chúng tôi không dùng dữ liệu của bạn để quảng cáo của bên thứ ba và không bán dữ liệu cá nhân.</P>
      </Muc>

      <Muc so={3} tieuDe="Dữ liệu vị trí (dữ liệu nhạy cảm)">
        <P>
          Pháp luật xếp dữ liệu vị trí xác định qua dịch vụ định vị vào nhóm dữ liệu nhạy cảm, vì vậy chúng tôi nêu riêng và chỉ
          xử lý khi có sự đồng ý rõ ràng của bạn.
        </P>
        <Ds>
          <li>
            <strong>Thợ:</strong> tọa độ trung tâm khu vực hoạt động (bạn chọn trên bản đồ hoặc lấy từ vị trí hiện tại) được lưu
            và hiển thị công khai cùng địa chỉ để Khách tìm thợ gần mình. Hãy chọn điểm đại diện cho khu vực làm việc, không
            nhất thiết là nhà riêng.
          </li>
          <li>
            <strong>Khách:</strong> vị trí thiết bị chỉ được dùng khi bạn cho phép trên trình duyệt, để tính khoảng cách tới
            Thợ. Vị trí này được xử lý trên thiết bị của bạn và không được lưu vào cơ sở dữ liệu của chúng tôi. Khi bạn dùng
            &ldquo;vị trí hiện tại&rdquo; để điền địa chỉ, tọa độ được gửi cho Goong để đổi thành địa chỉ.
          </li>
          <li>Bạn có thể tắt quyền vị trí trong trình duyệt bất cứ lúc nào và nhập địa chỉ bằng tay.</li>
        </Ds>
      </Muc>

      <Muc so={4} tieuDe="Cơ sở xử lý">
        <Ds>
          <li>Sự đồng ý của bạn khi đăng ký (được ghi nhận kèm thời điểm và phiên bản văn bản đã đồng ý).</li>
          <li>Thực hiện dịch vụ bạn yêu cầu: tạo đơn, kết nối với Thợ, trao đổi, xác nhận hoàn thành.</li>
          <li>Tuân thủ nghĩa vụ pháp luật, như phối hợp với cơ quan nhà nước có thẩm quyền.</li>
          <li>Bảo vệ quyền, lợi ích hợp pháp của bạn, của người dùng khác và của Nền tảng, như phòng chống gian lận.</li>
        </Ds>
      </Muc>

      <Muc so={5} tieuDe="Ai nhìn thấy dữ liệu của bạn">
        <Ds>
          <li>
            <strong>Thợ của đơn:</strong> thấy tên, số điện thoại, địa chỉ hẹn, giờ hẹn và ghi chú trong đơn của bạn.
          </li>
          <li>
            <strong>Khách:</strong> thấy thông tin công khai của Thợ (mục 3 và Điều khoản). Số điện thoại Thợ chỉ hiển thị khi đã đăng nhập.
          </li>
          <li>
            <strong>Công khai:</strong> đánh giá (số sao, nhận xét) và hồ sơ công khai của Thợ.
          </li>
          <li>
            <strong>Đơn vị vận hành:</strong> có thể truy cập dữ liệu để hỗ trợ, xử lý khiếu nại, báo cáo vi phạm và bảo đảm an toàn hệ thống.
          </li>
          <li>
            <strong>Cơ quan nhà nước:</strong> khi có yêu cầu hợp pháp bằng văn bản theo quy định pháp luật.
          </li>
        </Ds>
      </Muc>

      <Muc so={6} tieuDe="Bên thứ ba hỗ trợ vận hành">
        <Ds>
          <li><strong>Supabase:</strong> lưu cơ sở dữ liệu và xác thực đăng nhập.</li>
          <li><strong>Vercel:</strong> lưu trữ và phân phối website.</li>
          <li><strong>Goong:</strong> gợi ý địa chỉ, bản đồ và đổi tọa độ thành địa chỉ; nhận nội dung địa chỉ bạn gõ hoặc tọa độ bạn chọn.</li>
          <li><strong>Google Fonts:</strong> tải phông chữ; việc này có thể cho Google biết địa chỉ IP của thiết bị.</li>
        </Ds>
        <P>
          Các nhà cung cấp này có thể đặt máy chủ ngoài lãnh thổ Việt Nam. Chúng tôi chỉ chuyển dữ liệu ra nước ngoài trong phạm
          vi cần thiết để vận hành Nền tảng và thực hiện các thủ tục mà pháp luật yêu cầu đối với việc chuyển dữ liệu cá nhân ra
          nước ngoài.
        </P>
      </Muc>

      <Muc so={7} tieuDe="Thời gian lưu trữ">
        <Ds>
          <li>Dữ liệu tài khoản được lưu trong thời gian tài khoản còn hoạt động.</li>
          <li>Dữ liệu đơn, tin nhắn, đánh giá, báo cáo được lưu trong thời gian cần thiết để cung cấp dịch vụ, giải quyết khiếu nại, và theo yêu cầu của pháp luật.</li>
          <li>
            Khi bạn yêu cầu xóa, chúng tôi xóa hoặc ẩn danh dữ liệu trong vòng {CAM_KET.xuLyYeuCauDuLieuNgay} ngày, trừ dữ liệu pháp luật
            yêu cầu giữ hoặc cần cho khiếu nại, tranh chấp chưa giải quyết xong.
          </li>
        </Ds>
      </Muc>

      <Muc so={8} tieuDe="Quyền của bạn">
        <Ds>
          <li>Được biết về việc xử lý dữ liệu của mình; đồng ý hoặc không đồng ý.</li>
          <li>Xem, chỉnh sửa hoặc yêu cầu chỉnh sửa; yêu cầu cung cấp bản sao dữ liệu.</li>
          <li>Rút lại sự đồng ý; yêu cầu xóa dữ liệu; hạn chế hoặc phản đối việc xử lý.</li>
          <li>Khiếu nại, tố cáo, khởi kiện và yêu cầu bồi thường thiệt hại theo quy định của pháp luật; tự bảo vệ quyền của mình.</li>
        </Ds>
        <P>
          Bạn có thể xem và sửa một phần thông tin ở trang Hồ sơ hoặc Cài đặt. Với các yêu cầu còn lại (rút đồng ý, xóa dữ liệu, sao
          chép, phản đối), hãy liên hệ {T.soDienThoai} hoặc {T.email}. Chúng tôi có thể xác minh danh tính trước khi xử lý và phản hồi
          trong vòng {CAM_KET.xuLyYeuCauDuLieuNgay} ngày. Rút lại sự đồng ý không ảnh hưởng đến việc xử lý đã thực hiện trước đó, nhưng
          có thể khiến chúng tôi không thể tiếp tục cung cấp dịch vụ cho bạn.
        </P>
      </Muc>

      <Muc so={9} tieuDe="Bảo mật">
        <Ds>
          <li>Kết nối được mã hóa (HTTPS); mật khẩu được mã hóa bởi hệ thống xác thực.</li>
          <li>Cơ sở dữ liệu áp dụng phân quyền theo từng dòng và từng cột: ví dụ, số điện thoại Thợ không hiển thị cho người chưa đăng nhập; người dùng chỉ xem được đơn của chính mình.</li>
          <li>
            Khi xảy ra vi phạm dữ liệu cá nhân, chúng tôi sẽ thông báo cho cơ quan có thẩm quyền và cho người bị ảnh hưởng theo thời
            hạn pháp luật quy định (hiện là trong vòng {CAM_KET.baoSuCoDuLieuGio} giờ kể từ khi phát hiện).
          </li>
          <li>Không có hệ thống nào an toàn tuyệt đối. Hãy giữ kín mật khẩu và đăng xuất trên thiết bị dùng chung.</li>
        </Ds>
      </Muc>

      <Muc so={10} tieuDe="Người dưới 18 tuổi">
        <P>Nền tảng không dành cho người dưới 18 tuổi và chúng tôi không chủ định thu thập dữ liệu của họ. Nếu phát hiện, chúng tôi sẽ xóa dữ liệu đó.</P>
      </Muc>

      <Muc so={11} tieuDe="Lưu trữ trên trình duyệt">
        <P>
          Nền tảng dùng bộ nhớ của trình duyệt (như local storage hoặc cookie) để giữ phiên đăng nhập của bạn. Chúng tôi không dùng
          công cụ theo dõi quảng cáo.
        </P>
      </Muc>

      <Muc so={12} tieuDe="Thay đổi chính sách và liên hệ">
        <P>
          Khi có thay đổi quan trọng, chúng tôi sẽ thông báo trên Nền tảng và xin lại sự đồng ý nếu pháp luật yêu cầu. Mọi thắc mắc
          về dữ liệu cá nhân, liên hệ {T.soDienThoai} hoặc {T.email}. Xem thêm{" "}
          <Link href="/dieu-khoan" className="text-rust hover:underline">Điều khoản sử dụng</Link> và{" "}
          <Link href="/quy-che" className="text-rust hover:underline">Quy chế hoạt động</Link>.
        </P>
      </Muc>
    </TrangPhapLy>
  );
}