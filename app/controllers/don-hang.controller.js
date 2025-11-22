// app/controllers/don-hang.controller.js
const DonHangService = require("../services/don-hang.service");
const VnpayService = require("../services/vnpay.service");
const ApiError = require("../api-error");

// [USER] Tạo đơn hàng mới
exports.create = async (req, res, next) => {
  try {
    // ... (Phần validate input giữ nguyên) ...
    if (
      !req.body.ma_dia_chi ||
      !req.body.phuong_thuc_thanh_toan ||
      !req.body.cartItemIds
    ) {
      return next(
        new ApiError(
          400,
          "Vui lòng chọn địa chỉ, phương thức thanh toán và sản phẩm muốn mua."
        )
      );
    }

    // 1. Tạo đơn hàng trong CSDL trước
    const result = await DonHangService.createOrder(req.user.id, req.body);

    // 2. Kiểm tra phương thức thanh toán
    if (req.body.phuong_thuc_thanh_toan === "vnpay") {
      // SỬ DỤNG LUÔN result.totalAmount MÀ KHÔNG CẦN GỌI LẠI CSDL
      const vnpUrl = VnpayService.createPaymentUrl(
        req,
        result.orderId,
        result.totalAmount
      );

      return res.send({
        ...result,
        paymentUrl: vnpUrl,
      });
    }

    // Nếu là COD, trả về bình thường
    return res.send(result);
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    // ... (Phần xử lý lỗi giữ nguyên) ...
    return next(
      new ApiError(500, "Đã có lỗi xảy ra phía server khi tạo đơn hàng.")
    );
  }
};

/**
 * [ADMIN] Lấy danh sách tất cả các đơn hàng.
 */
exports.findAllOrders = async (req, res, next) => {
  try {
    const documents = await DonHangService.findAll();
    return res.send(documents);
  } catch (error) {
    console.error("ERROR IN findAllOrders:", error);
    return next(new ApiError(500, "Lỗi khi lấy danh sách tất cả đơn hàng"));
  }
};

/**
 * [ADMIN] Cập nhật trạng thái của một đơn hàng.
 */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { trang_thai } = req.body;
    const staffId = req.user.id;
    const orderId = req.params.id;

    if (!trang_thai) {
      return next(new ApiError(400, "Trạng thái mới là bắt buộc"));
    }

    const updated = await DonHangService.updateStatus(
      orderId,
      staffId,
      trang_thai
    );

    if (!updated) {
      return next(new ApiError(404, "Không tìm thấy đơn hàng"));
    }
    return res.send({
      message: "Trạng thái đơn hàng đã được cập nhật thành công",
    });
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);
    return next(new ApiError(500, "Lỗi khi cập nhật trạng thái đơn hàng"));
  }
};
/**
 * [USER] Lấy danh sách đơn hàng của người dùng đang đăng nhập.
 */
exports.findAllForUser = async (req, res, next) => {
  try {
    const documents = await DonHangService.findAllByUserId(req.user.id);
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy lịch sử đơn hàng"));
  }
};

/**
 * [USER] Lấy chi tiết một đơn hàng của người dùng đang đăng nhập.
 */
exports.findOneForUser = async (req, res, next) => {
  try {
    const document = await DonHangService.findOneByUserId(
      req.user.id,
      req.params.id
    );
    if (!document) {
      return next(
        new ApiError(
          404,
          "Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập"
        )
      );
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi lấy chi tiết đơn hàng với id=${req.params.id}`)
    );
  }
};
