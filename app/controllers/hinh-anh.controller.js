const HinhAnhService = require("../services/hinh-anh.service");
const ApiError = require("../api-error");

exports.addImages = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    // `req.files` là một mảng các file được upload, do multer tạo ra
    const documents = await HinhAnhService.addImages(productId, req.files);
    return res.status(201).send(documents);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi thêm hình ảnh"));
  }
};

exports.deleteImage = async (req, res, next) => {
  try {
    const deleted = await HinhAnhService.deleteImage(req.params.id);
    if (!deleted) {
      return next(new ApiError(404, "Không tìm thấy hình ảnh"));
    }
    return res.send({ message: "Hình ảnh đã được xóa" });
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi xóa hình ảnh với id=${req.params.id}`)
    );
  }
};
