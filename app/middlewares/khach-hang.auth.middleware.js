// app/middlewares/khach-hang.auth.middleware.js

const jwt = require("jsonwebtoken");
const ApiError = require("../api-error");

const khachHangAuth = (req, res, next) => {
  // Lấy token từ header, dạng "Bearer <token>"
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    // Nếu không có token, trả lỗi 401 Unauthorized
    return next(new ApiError(401, "Yêu cầu token để xác thực."));
  }

  // Xác thực token
  jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
    if (err) {
      // Nếu token sai hoặc hết hạn, trả lỗi 403 Forbidden
      return next(new ApiError(403, "Token không hợp lệ."));
    }

    // KIỂM TRA QUAN TRỌNG: Token này có phải của khách hàng không?
    if (decodedUser.type !== "khach_hang") {
      return next(
        new ApiError(
          403,
          "Không có quyền truy cập. Yêu cầu vai trò khách hàng."
        )
      );
    }

    // Nếu mọi thứ OK, lưu thông tin user đã giải mã vào request
    req.user = decodedUser; // payload sẽ là { id: ..., type: 'khach_hang' }
    next(); // Cho phép đi tiếp đến controller
  });
};

module.exports = khachHangAuth;
