// app/controllers/khach-hang.controller.js

const KhachHangService = require("../services/khach-hang.service");
const ApiError = require("../api-error");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Hàm Đăng ký cho Khách hàng
exports.signUp = async (req, res, next) => {
  try {
    // 1. Validate input
    if (!req.body?.email || !req.body?.mat_khau || !req.body?.ho_ten) {
      return next(new ApiError(400, "Họ tên, email và mật khẩu là bắt buộc"));
    }

    // 2. Kiểm tra email đã tồn tại chưa
    const existingUser = await KhachHangService.findByEmail(req.body.email);
    if (existingUser) {
      return next(new ApiError(409, "Email đã được sử dụng"));
    }

    // 3. Băm mật khẩu
    const hashedPassword = await bcrypt.hash(req.body.mat_khau, 10);

    // 4. Tạo khách hàng mới trong CSDL (Service đã được sửa để không cần vai_tro)
    const newCustomer = await KhachHangService.create({
      ...req.body,
      mat_khau: hashedPassword, // Lưu mật khẩu đã băm
    });

    // Không trả về mật khẩu
    delete newCustomer.mat_khau;

    return res.status(201).send(newCustomer);
  } catch (error) {
    console.error("CUSTOMER SIGNUP ERROR:", error);
    return next(new ApiError(500, "Có lỗi xảy ra khi đăng ký tài khoản"));
  }
};

// Hàm Đăng nhập cho Khách hàng
exports.signIn = async (req, res, next) => {
  try {
    // 1. Validate input
    if (!req.body?.email || !req.body?.mat_khau) {
      return next(new ApiError(400, "Email và mật khẩu là bắt buộc"));
    }

    // 2. Tìm khách hàng bằng email
    const customer = await KhachHangService.findByEmail(req.body.email);
    if (!customer) {
      return next(new ApiError(401, "Sai thông tin đăng nhập")); // Lỗi 401: Unauthorized
    }

    // 3. So sánh mật khẩu
    const isPasswordValid = await bcrypt.compare(
      req.body.mat_khau,
      customer.mat_khau
    );
    if (!isPasswordValid) {
      return next(new ApiError(401, "Sai thông tin đăng nhập"));
    }

    // 4. TẠO JWT TOKEN (ĐÂY LÀ CHỖ THAY ĐỔI QUAN TRỌNG NHẤT)
    // Payload bây giờ không còn vai_tro, thay vào đó ta có thể thêm một 'type'
    const token = jwt.sign(
      { id: customer.id, type: "khach_hang" }, // Payload chỉ chứa id và loại tài khoản
      process.env.JWT_SECRET, // Lấy khóa bí mật từ file .env
      { expiresIn: "24h" } // Token hết hạn sau 24 giờ
    );

    // 5. Trả về thông tin khách hàng và token
    return res.send({
      id: customer.id,
      email: customer.email,
      ho_ten: customer.ho_ten,
      accessToken: token,
    });
  } catch (error) {
    console.error("CUSTOMER SIGNIN ERROR:", error);
    return next(new ApiError(500, "Có lỗi xảy ra khi đăng nhập"));
  }
};

// (Các hàm CRUD khác cho khách hàng tự quản lý profile sẽ được thêm sau)
// Lấy thông tin cá nhân của người dùng đang đăng nhập
exports.getProfile = async (req, res, next) => {
  try {
    // Middleware đã xác thực và lưu user vào req.user
    const userProfile = await KhachHangService.findById(req.user.id);
    if (!userProfile) {
      return next(new ApiError(404, "Không tìm thấy khách hàng"));
    }
    return res.send(userProfile);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy thông tin cá nhân"));
  }
};

// Cho phép khách hàng tự cập nhật thông tin cá nhân
exports.updateProfile = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }
  try {
    const document = await KhachHangService.updateProfile(
      req.user.id,
      req.body
    );
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy khách hàng"));
    }
    return res.send({
      message: "Thông tin cá nhân đã được cập nhật",
      data: document,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi cập nhật thông tin cá nhân"));
  }
};
/**
 * [ADMIN] Lấy danh sách tất cả khách hàng.
 */
exports.findAllForAdmin = async (req, res, next) => {
  try {
    const documents = await KhachHangService.findAll();
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách khách hàng"));
  }
};

/**
 * [ADMIN] Xóa một khách hàng.
 */
exports.deleteForAdmin = async (req, res, next) => {
  try {
    const deleted = await KhachHangService.delete(req.params.id);
    if (!deleted) {
      return next(new ApiError(404, "Không tìm thấy khách hàng"));
    }
    return res.send({ message: "Khách hàng đã được xóa thành công" });
  } catch (error) {
    // Bắt lỗi nghiệp vụ từ service
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(
      new ApiError(500, `Lỗi khi xóa khách hàng với id=${req.params.id}`)
    );
  }
};
