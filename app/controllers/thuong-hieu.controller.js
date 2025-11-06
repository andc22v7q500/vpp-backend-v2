// app/controllers/thuong-hieu.controller.js
const ThuongHieuService = require("../services/thuong-hieu.service");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
  if (!req.body?.ten_thuong_hieu) {
    return next(new ApiError(400, "Tên thương hiệu không được để trống"));
  }
  try {
    const document = await ThuongHieuService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Có lỗi xảy ra khi tạo thương hiệu"));
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const documents = await ThuongHieuService.findAll();
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "Có lỗi xảy ra khi lấy danh sách thương hiệu")
    );
  }
};

// Lấy một
exports.findOne = async (req, res, next) => {
  try {
    const document = await ThuongHieuService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy thương hiệu"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi lấy thương hiệu với id=${req.params.id}`)
    );
  }
};

// Cập nhật
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }
  try {
    const document = await ThuongHieuService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy thương hiệu"));
    }
    return res.send({ message: "thương hiệu đã được cập nhật thành công" });
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi cập nhật thương hiệu với id=${req.params.id}`)
    );
  }
};

// Xóa
exports.delete = async (req, res, next) => {
  try {
    const deleted = await ThuongHieuService.delete(req.params.id);
    if (!deleted) {
      return next(new ApiError(404, "Không tìm thấy thương hiệu"));
    }
    return res.send({ message: "thương hiệu đã được xóa thành công" });
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi xóa thương hiệu với id=${req.params.id}`)
    );
  }
};
