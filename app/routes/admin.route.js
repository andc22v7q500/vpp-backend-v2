// app/routes/admin.route.js
const express = require("express");
const donHangController = require("../controllers/don-hang.controller");
const nhanVienAuth = require("../middlewares/nhan-vien.auth.middleware");
const phieuNhapController = require("../controllers/phieu-nhap.controller");
// ... (import các controller và middleware khác)

const router = express.Router();

// Áp dụng bảo vệ chung cho toàn bộ route admin
router.use(nhanVienAuth);

// === QUẢN LÝ ĐƠN HÀNG ===
router.route("/don-hang").get(donHangController.findAllOrders);

router
  .route("/don-hang/:id/trang-thai")
  .put(donHangController.updateOrderStatus);

// === QUẢN LÝ KHO (NHẬP HÀNG) ===
router
  .route("/phieu-nhap")
  .post(phieuNhapController.create)
  .get(phieuNhapController.findAll);

router.route("/phieu-nhap/:id").get(phieuNhapController.findOne);

module.exports = router;
