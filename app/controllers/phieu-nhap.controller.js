// app/controllers/phieu-nhap.controller.js

const PhieuNhapService = require("../services/phieu-nhap.service");
const ApiError = require("../api-error");

// Tạo phiếu nhập mới
exports.create = async (req, res, next) => {
  try {
    const staffId = req.user.id;
    const document = await PhieuNhapService.create(staffId, req.body);
    return res.status(201).send(document);
  } catch (error) {
    console.error("CREATE PHIEU NHAP ERROR:", error);
    return next(new ApiError(500, "Lỗi khi tạo phiếu nhập hàng."));
  }
};

// Lấy danh sách phiếu nhập
exports.findAll = async (req, res, next) => {
  try {
    const documents = await PhieuNhapService.findAll();
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách phiếu nhập."));
  }
};

// Lấy chi tiết một phiếu nhập
exports.findOne = async (req, res, next) => {
  try {
    const document = await PhieuNhapService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy phiếu nhập."));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Lỗi khi lấy chi tiết phiếu nhập với id=${req.params.id}`
      )
    );
  }
};
