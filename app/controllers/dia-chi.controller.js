// app/controllers/dia-chi.controller.js

const DiaChiService = require("../services/dia-chi.service");
const ApiError = require("../api-error");

// Tạo một địa chỉ mới cho người dùng đang đăng nhập
exports.create = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const document = await DiaChiService.create(userId, req.body);
    return res.status(201).send(document);
  } catch (error) {
    console.error("CREATE ADDRESS ERROR:", error);
    return next(new ApiError(500, "Lỗi khi tạo địa chỉ mới"));
  }
};

// Lấy danh sách địa chỉ của người dùng đang đăng nhập
exports.findAllForUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const documents = await DiaChiService.findAllByUserId(userId);
    return res.send(documents);
  } catch (error) {
    console.error("FIND ALL ADDRESSES ERROR:", error);
    return next(new ApiError(500, "Lỗi khi lấy danh sách địa chỉ"));
  }
};

// Cập nhật một địa chỉ của người dùng đang đăng nhập
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }
  try {
    const userId = req.user.id;
    const addressId = req.params.id;
    const updated = await DiaChiService.update(addressId, userId, req.body);
    if (!updated) {
      return next(
        new ApiError(404, "Không tìm thấy địa chỉ hoặc không có quyền cập nhật")
      );
    }
    return res.send({ message: "Địa chỉ đã được cập nhật thành công" });
  } catch (error) {
    console.error("UPDATE ADDRESS ERROR:", error);
    return next(
      new ApiError(500, `Lỗi khi cập nhật địa chỉ với id=${req.params.id}`)
    );
  }
};

// Xóa một địa chỉ của người dùng đang đăng nhập
exports.delete = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;
    const deleted = await DiaChiService.delete(addressId, userId);
    if (!deleted) {
      return next(
        new ApiError(404, "Không tìm thấy địa chỉ hoặc không có quyền xóa")
      );
    }
    return res.send({ message: "Địa chỉ đã được xóa thành công" });
  } catch (error) {
    console.error("DELETE ADDRESS ERROR:", error);
    return next(
      new ApiError(500, `Lỗi khi xóa địa chỉ với id=${req.params.id}`)
    );
  }
};
