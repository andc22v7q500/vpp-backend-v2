// app/controllers/vnpay.controller.js
const VnpayService = require("../services/vnpay.service");
const pool = require("../config/mysql.config");
const ApiError = require("../api-error");

exports.vnpayReturn = async (req, res, next) => {
  let vnp_Params = req.query;

  // Gọi Service để kiểm tra checksum
  const result = VnpayService.verifyReturnUrl(vnp_Params);

  if (result.isSuccess) {
    try {
      // Nếu thanh toán thành công, cập nhật trạng thái đơn hàng
      // Từ 'cho_thanh_toan' -> 'cho_xac_nhan'
      await pool.execute(
        "UPDATE don_hang SET trang_thai = 'cho_xac_nhan' WHERE id = ?",
        [result.orderId]
      );

      // Trả về kết quả thành công cho Front-end
      return res.send({
        message: "Xác thực thanh toán thành công",
        orderId: result.orderId,
      });
    } catch (error) {
      return next(new ApiError(500, "Lỗi khi cập nhật trạng thái đơn hàng"));
    }
  } else {
    // Nếu checksum thất bại hoặc giao dịch lỗi, trả lỗi về Front-end
    return next(new ApiError(400, result.message));
  }
};
