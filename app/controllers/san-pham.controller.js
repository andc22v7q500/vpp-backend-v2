// app/controllers/san-pham.controller.js

const SanPhamService = require("../services/san-pham.service");
const ApiError = require("../api-error");

// [ADMIN] Tạo mới một sản phẩm (thông tin chung)
exports.create = async (req, res, next) => {
  // Validate dữ liệu đầu vào
  if (
    !req.body?.ten_san_pham ||
    !req.body?.ma_danh_muc ||
    !req.body?.ma_thuong_hieu
  ) {
    return next(
      new ApiError(
        400,
        "Tên sản phẩm, mã danh mục và mã thương hiệu là bắt buộc"
      )
    );
  }
  try {
    const document = await SanPhamService.create(req.body);
    return res.status(201).send(document);
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    return next(new ApiError(500, "Có lỗi xảy ra khi tạo sản phẩm"));
  }
};

// [PUBLIC] Lấy danh sách tất cả sản phẩm
exports.findAll = async (req, res, next) => {
  try {
    const documents = await SanPhamService.findAll();
    return res.send(documents);
  } catch (error) {
    console.error("FIND ALL PRODUCTS ERROR:", error);
    return next(new ApiError(500, "Có lỗi xảy ra khi lấy danh sách sản phẩm"));
  }
};

// [PUBLIC] Lấy chi tiết một sản phẩm (kèm mẫu mã và hình ảnh)
exports.findOne = async (req, res, next) => {
  try {
    const document = await SanPhamService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy sản phẩm"));
    }
    return res.send(document);
  } catch (error) {
    console.error("FIND ONE PRODUCT ERROR:", error);
    return next(
      new ApiError(500, `Lỗi khi lấy sản phẩm với id=${req.params.id}`)
    );
  }
};

// [ADMIN] Cập nhật thông tin chung của sản phẩm
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }
  try {
    const document = await SanPhamService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy sản phẩm"));
    }
    return res.send({
      message: "Sản phẩm đã được cập nhật thành công",
      data: document,
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    return next(
      new ApiError(500, `Lỗi khi cập nhật sản phẩm với id=${req.params.id}`)
    );
  }
};

// [ADMIN] Xóa một sản phẩm (và các mẫu mã, hình ảnh liên quan)
exports.delete = async (req, res, next) => {
  try {
    const deleted = await SanPhamService.delete(req.params.id);
    if (!deleted) {
      return next(new ApiError(404, "Không tìm thấy sản phẩm"));
    }
    return res.send({ message: "Sản phẩm đã được xóa thành công" });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    return next(
      new ApiError(500, `Lỗi khi xóa sản phẩm với id=${req.params.id}`)
    );
  }
};
