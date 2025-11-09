// app/routes/dia-chi.route.js

const express = require("express");
const diachi = require("../controllers/dia-chi.controller");
const khachHangAuth = require("../middlewares/khach-hang.auth.middleware");

const router = express.Router();

// Áp dụng middleware xác thực cho tất cả các route trong file này
// Chỉ khách hàng đã đăng nhập mới có thể quản lý sổ địa chỉ của họ
router.use(khachHangAuth);

// Các hành động trên URL gốc "/api/dia-chi"
router
  .route("/")
  .get(diachi.findAllForUser) // Lấy danh sách địa chỉ
  .post(diachi.create); // Tạo địa chỉ mới

// Các hành động trên một địa chỉ cụ thể "/api/dia-chi/:id"
router
  .route("/:id")
  .put(diachi.update) // Cập nhật địa chỉ
  .delete(diachi.delete); // Xóa địa chỉ

module.exports = router;
