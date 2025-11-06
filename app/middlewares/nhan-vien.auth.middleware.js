// app/middlewares/nhan-vien.auth.middleware.js

const jwt = require("jsonwebtoken");
const ApiError = require("../api-error");

const nhanVienAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return next(new ApiError(401, "Yêu cầu token để xác thực."));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return next(new ApiError(403, "Token không hợp lệ."));
    }

    // KIỂM TRA QUAN TRỌNG: Token này có phải của nhân viên không?
    if (decodedUser.type !== "nhan_vien") {
      return next(
        new ApiError(403, "Không có quyền truy cập. Yêu cầu vai trò quản trị.")
      );
    }

    req.user = decodedUser; // payload sẽ là { id: ..., type: 'nhan_vien' }
    next();
  });
};

module.exports = nhanVienAuth;
