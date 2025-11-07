// app/controllers/mau-ma-san-pham.controller.js
const MauMaSanPhamService = require("../services/mau-ma-san-pham.service");
const ApiError = require("../api-error");

// Tạo mới mẫu mã cho một sản phẩm
exports.create = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const document = await MauMaSanPhamService.create(productId, req.body);
    return res.status(201).send(document);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi tạo mẫu mã sản phẩm"));
  }
};

// Cập nhật một mẫu mã
exports.update = async (req, res, next) => {
  try {
    const document = await MauMaSanPhamService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy mẫu mã"));
    }
    return res.send({ message: "Mẫu mã đã được cập nhật", data: document });
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi cập nhật mẫu mã với id=${req.params.id}`)
    );
  }
};

// Xóa một mẫu mã
exports.delete = async (req, res, next) => {
  try {
    const deleted = await MauMaSanPhamService.delete(req.params.id);
    if (!deleted) {
      return next(new ApiError(404, "Không tìm thấy mẫu mã"));
    }
    return res.send({ message: "Mẫu mã đã được xóa" });
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi xóa mẫu mã với id=${req.params.id}`)
    );
  }
};
