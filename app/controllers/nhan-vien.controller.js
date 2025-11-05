// app/controllers/nhan-vien.controller.js

const NhanVienService = require("../services/nhan-vien.service");
const ApiError = require("../api-error");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Hàm Đăng nhập cho Nhân viên
exports.signIn = async (req, res, next) => {
  try {
    if (!req.body?.email || !req.body?.mat_khau) {
      return next(new ApiError(400, "Email và mật khẩu là bắt buộc"));
    }

    const staff = await NhanVienService.findByEmail(req.body.email);
    if (!staff) {
      return next(new ApiError(401, "Sai thông tin đăng nhập"));
    }

    const isPasswordValid = await bcrypt.compare(
      req.body.mat_khau,
      staff.mat_khau
    );
    if (!isPasswordValid) {
      return next(new ApiError(401, "Sai thông tin đăng nhập"));
    }

    // Tạo JWT token với payload khác biệt
    const token = jwt.sign(
      { id: staff.id, type: "nhan_vien" }, // Gán cứng 'type' là 'nhan_vien'
      process.env.JWT_SECRET,
      { expiresIn: "8h" } // Token của nhân viên có thể có thời hạn ngắn hơn
    );

    return res.send({
      id: staff.id,
      email: staff.email,
      ho_ten: staff.ho_ten,
      accessToken: token,
    });
  } catch (error) {
    console.error("STAFF SIGNIN ERROR:", error);
    return next(new ApiError(500, "Có lỗi xảy ra khi đăng nhập"));
  }
};
