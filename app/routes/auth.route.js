// app/routes/auth.route.js
const express = require("express");
const khachhang = require("../controllers/khach-hang.controller");
const nhanVienController = require("../controllers/nhan-vien.controller");

const router = express.Router();

// ===== CÁC ROUTE CHO KHÁCH HÀNG =====
router.post("/khach-hang/signup", khachhang.signUp);
router.post("/khach-hang/signin", khachhang.signIn);

// ===== CÁC ROUTE CHO NHÂN VIÊN =====
router.post("/nhan-vien/signin", nhanVienController.signIn);

module.exports = router;
