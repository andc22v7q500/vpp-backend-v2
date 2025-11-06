// app/controllers/danh-muc.controller.js
const DanhMucService = require("../services/danh-muc.service");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
  if (!req.body?.ten_danh_muc) {
    return next(new ApiError(400, "Tên danh mục không được để trống"));
  }
  try {
    const document = await DanhMucService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Có lỗi xảy ra khi tạo danh mục"));
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const documents = await DanhMucService.findAll();
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Có lỗi xảy ra khi lấy danh sách danh mục"));
  }
};

// Lấy một
exports.findOne = async (req, res, next) => {
  try {
    const document = await DanhMucService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy danh mục"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi lấy danh mục với id=${req.params.id}`)
    );
  }
};

// Cập nhật
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }
  try {
    const document = await DanhMucService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy danh mục"));
    }
    return res.send({ message: "Danh mục đã được cập nhật thành công" });
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi cập nhật danh mục với id=${req.params.id}`)
    );
  }
};

// Xóa
exports.delete = async (req, res, next) => {
  try {
    const deleted = await DanhMucService.delete(req.params.id);
    if (!deleted) {
      return next(new ApiError(404, "Không tìm thấy danh mục"));
    }
    return res.send({ message: "Danh mục đã được xóa thành công" });
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi xóa danh mục với id=${req.params.id}`)
    );
  }
};
