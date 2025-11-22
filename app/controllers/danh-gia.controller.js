// app/controllers/danh-gia.controller.js

const DanhGiaService = require("../services/danh-gia.service");
const ApiError = require("../api-error");

/**
 * [USER] Cho phép khách hàng đang đăng nhập gửi một đánh giá mới.
 */
exports.create = async (req, res, next) => {
  try {
    const userId = req.user.id; // Lấy từ khachHangAuth middleware
    const productId = req.params.productId; // Lấy từ URL

    // Validate input
    if (req.body.so_sao === undefined || !req.body.binh_luan) {
      return next(new ApiError(400, "Số sao và bình luận là bắt buộc."));
    }
    if (req.body.so_sao < 1 || req.body.so_sao > 5) {
      return next(new ApiError(400, "Số sao phải từ 1 đến 5."));
    }

    const result = await DanhGiaService.create(userId, productId, req.body);

    // Service sẽ trả về một object có 'error' nếu logic nghiệp vụ không thỏa mãn
    if (result.error) {
      return next(new ApiError(result.error, result.message));
    }

    return res.status(201).send(result);
  } catch (error) {
    console.error("CREATE REVIEW ERROR:", error);
    return next(new ApiError(500, "Lỗi khi tạo đánh giá mới."));
  }
};

/**
 * [ADMIN] Lấy danh sách tất cả các đánh giá.
 */
exports.findAllForAdmin = async (req, res, next) => {
  try {
    const documents = await DanhGiaService.findAll();
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách đánh giá"));
  }
};

/**
 * [ADMIN] Xóa một đánh giá.
 */
exports.deleteForAdmin = async (req, res, next) => {
  try {
    const deleted = await DanhGiaService.delete(req.params.id);
    if (!deleted) {
      return next(new ApiError(404, "Không tìm thấy đánh giá"));
    }
    return res.send({ message: "Đánh giá đã được xóa thành công" });
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi xóa đánh giá với id=${req.params.id}`)
    );
  }
};

exports.checkPermission = async (req, res, next) => {
  try {
    const canReview = await DanhGiaService.checkUserPermission(
      req.user.id,
      req.params.productId
    );
    return res.send({ canReview });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi kiểm tra quyền đánh giá"));
  }
};
