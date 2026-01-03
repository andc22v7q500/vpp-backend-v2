// app/middlewares/super-admin.auth.middleware.js
const ApiError = require("../api-error");

const superAdminAuth = (req, res, next) => {
  // Middleware này LUÔN chạy sau 'nhanVienAuth',

  // KIỂM TRA QUAN TRỌNG: Nhân viên này có phải là ID số 1 không?
  if (req.user && req.user.id === 1) {
    next(); // Là Super Admin, cho đi tiếp
  } else {
    // Không phải, chặn lại
    return next(
      new ApiError(403, "Hành động bị từ chối. Yêu cầu quyền Super Admin.")
    );
  }
};

module.exports = superAdminAuth;
