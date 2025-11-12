// app/controllers/nhan-vien.controller.js

const NhanVienService = require("../services/nhan-vien.service");
const ApiError = require("../api-error");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// [PUBLIC] Hàm Đăng nhập cho Nhân viên
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

    const token = jwt.sign(
      { id: staff.id, type: "nhan_vien" },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
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

// --- CÁC HÀM CRUD CHO SUPER ADMIN ---

// [SUPER ADMIN] Tạo mới một nhân viên
exports.create = async (req, res, next) => {
  try {
    if (!req.body?.email || !req.body?.mat_khau || !req.body?.ho_ten) {
      return next(new ApiError(400, "Họ tên, email và mật khẩu là bắt buộc"));
    }
    const existingStaff = await NhanVienService.findByEmail(req.body.email);
    if (existingStaff) {
      return next(new ApiError(409, "Email đã được sử dụng"));
    }
    const hashedPassword = await bcrypt.hash(req.body.mat_khau, 10);

    const newStaff = await NhanVienService.create({
      ...req.body,
      mat_khau: hashedPassword,
    });

    return res.status(201).send(newStaff);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi tạo tài khoản nhân viên"));
  }
};

// [ADMIN] Lấy danh sách nhân viên
exports.findAll = async (req, res, next) => {
  try {
    const documents = await NhanVienService.findAll();
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách nhân viên"));
  }
};

// [ADMIN] Lấy chi tiết một nhân viên
exports.findOne = async (req, res, next) => {
  try {
    const document = await NhanVienService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy nhân viên"));
    }
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy chi tiết nhân viên"));
  }
};

// [SUPER ADMIN] Cập nhật thông tin nhân viên
exports.update = async (req, res, next) => {
  try {
    const updated = await NhanVienService.update(req.params.id, req.body);
    if (!updated) {
      return next(new ApiError(404, "Không tìm thấy nhân viên"));
    }
    return res.send({
      message: "Thông tin nhân viên đã được cập nhật",
      data: updated,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi cập nhật nhân viên"));
  }
};

// [SUPER ADMIN] Xóa một nhân viên
exports.delete = async (req, res, next) => {
  // Ngăn Super Admin tự xóa chính mình
  if (
    parseInt(req.params.id, 10) === 1 ||
    parseInt(req.params.id, 10) === req.user.id
  ) {
    return next(
      new ApiError(
        400,
        "Không thể tự xóa tài khoản Super Admin hoặc chính mình."
      )
    );
  }
  try {
    const deleted = await NhanVienService.delete(req.params.id);
    if (!deleted) {
      return next(new ApiError(404, "Không tìm thấy nhân viên"));
    }
    return res.send({ message: "Nhân viên đã được xóa" });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi xóa nhân viên"));
  }
};
