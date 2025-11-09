// app/routes/khach-hang.route.js
const express = require("express");
const khachhang = require("../controllers/khach-hang.controller");
const khachHangAuth = require("../middlewares/khach-hang.auth.middleware");

const router = express.Router();

// Áp dụng middleware xác thực cho tất cả các route trong file này
router.use(khachHangAuth);

router
  .route("/profile")
  .get(khachhang.getProfile) // Lấy thông tin profile
  .put(khachhang.updateProfile); // Cập nhật profile

module.exports = router;
