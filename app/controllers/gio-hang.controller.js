// app/controllers/gio-hang.controller.js

const GioHangService = require("../services/gio-hang.service");
const ApiError = require("../api-error");

// Thêm sản phẩm vào giỏ
exports.addItemToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { ma_mau_ma, so_luong } = req.body; // <-- Đổi từ ma_bien_the thành ma_mau_ma

    if (!ma_mau_ma || !so_luong || so_luong <= 0) {
      return next(
        new ApiError(400, "Mã mẫu mã và số lượng (lớn hơn 0) là bắt buộc")
      );
    }

    // 1. Tìm hoặc tạo giỏ hàng cho người dùng
    const cart = await GioHangService.findOrCreateCart(userId);
    // 2. Thêm sản phẩm vào giỏ hàng
    await GioHangService.addItem(cart.id, ma_mau_ma, so_luong);

    // 3. Lấy lại toàn bộ giỏ hàng đã cập nhật để trả về
    const updatedCartDetails = await GioHangService.getCartDetails(cart.id);

    return res.send(updatedCartDetails);
  } catch (error) {
    console.error("ADD ITEM TO CART ERROR:", error);
    return next(
      new ApiError(500, "Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng")
    );
  }
};

// Lấy giỏ hàng của người dùng
exports.getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cart = await GioHangService.findOrCreateCart(userId);
    const cartDetails = await GioHangService.getCartDetails(cart.id);
    return res.send(cartDetails);
  } catch (error) {
    console.error("GET CART ERROR:", error);
    return next(new ApiError(500, "Có lỗi xảy ra khi lấy thông tin giỏ hàng"));
  }
};

// Cập nhật số lượng của một item trong giỏ
exports.updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params; // itemId là id của chi_tiet_gio_hang
    const { so_luong } = req.body;

    if (so_luong === undefined) {
      return next(new ApiError(400, "Số lượng là bắt buộc"));
    }

    // Service đã xử lý logic nếu số lượng <= 0 thì sẽ xóa
    await GioHangService.updateItemQuantity(itemId, so_luong);

    // Lấy lại cartId để trả về giỏ hàng mới nhất
    const [item] = await pool.execute(
      "SELECT ma_gio_hang FROM chi_tiet_gio_hang WHERE id = ?",
      [itemId]
    );
    // (Đây là một cách, hoặc có thể thiết kế service.update trả về cartId)
    // Cách đơn giản hơn là chỉ trả về message
    return res.send({
      message: "Số lượng sản phẩm đã được cập nhật/xóa thành công",
    });
  } catch (error) {
    console.error("UPDATE CART ITEM ERROR:", error);
    return next(new ApiError(500, "Có lỗi xảy ra khi cập nhật giỏ hàng"));
  }
};

// Xóa sản phẩm khỏi giỏ
exports.removeCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const deleted = await GioHangService.removeItem(itemId);
    if (!deleted) {
      return next(new ApiError(404, "Không tìm thấy sản phẩm trong giỏ hàng"));
    }
    return res.send({ message: "Sản phẩm đã được xóa khỏi giỏ hàng" });
  } catch (error) {
    console.error("REMOVE CART ITEM ERROR:", error);
    return next(
      new ApiError(500, "Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng")
    );
  }
};

// Cần import pool ở đầu file cho hàm update
const pool = require("../config/mysql.config");
