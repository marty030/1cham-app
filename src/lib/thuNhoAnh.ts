// Thu nhỏ ảnh ngay trên trình duyệt trước khi tải lên:
//  - giảm dung lượng (ảnh chụp điện thoại thường 3–8 MB, sau khi thu nhỏ chỉ vài trăm KB);
//  - XÓA toàn bộ metadata của ảnh gốc (EXIF), trong đó có thể có tọa độ GPS nơi chụp —
//    ảnh đại diện của thợ là công khai nên không được để lộ vị trí này;
//  - luôn xuất ra JPEG, nên cũng khớp với giới hạn loại file của kho ảnh.
// Vẽ lại ảnh lên canvas rồi xuất mới là cách làm mất metadata (ảnh mới không mang theo EXIF).

async function docAnh(file: File): Promise<{ nguon: CanvasImageSource; rong: number; cao: number; giaiPhong: () => void }> {
  // Ưu tiên createImageBitmap (tự xoay đúng chiều theo thông tin chụp của ảnh)
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { nguon: bitmap, rong: bitmap.width, cao: bitmap.height, giaiPhong: () => bitmap.close() };
    } catch {
      // thử cách dự phòng bên dưới
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return {
      nguon: img,
      rong: img.naturalWidth,
      cao: img.naturalHeight,
      giaiPhong: () => URL.revokeObjectURL(url),
    };
  } catch (loi) {
    URL.revokeObjectURL(url);
    throw loi;
  }
}

export async function thuNhoAnhDaiDien(file: File, canhToiDa = 800, chatLuong = 0.85): Promise<Blob> {
  const anh = await docAnh(file);
  try {
    if (!anh.rong || !anh.cao) throw new Error("Ảnh không hợp lệ");

    const tiLe = Math.min(1, canhToiDa / Math.max(anh.rong, anh.cao));
    const rong = Math.max(1, Math.round(anh.rong * tiLe));
    const cao = Math.max(1, Math.round(anh.cao * tiLe));

    const canvas = document.createElement("canvas");
    canvas.width = rong;
    canvas.height = cao;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Trình duyệt không hỗ trợ xử lý ảnh");

    // Nền trắng: ảnh PNG trong suốt khi chuyển sang JPEG sẽ không bị đen
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rong, cao);
    ctx.drawImage(anh.nguon, 0, 0, rong, cao);

    return await new Promise<Blob>((giaiQuyet, tuChoi) => {
      canvas.toBlob(
        (blob) => (blob ? giaiQuyet(blob) : tuChoi(new Error("Không tạo được ảnh"))),
        "image/jpeg",
        chatLuong
      );
    });
  } finally {
    anh.giaiPhong();
  }
}