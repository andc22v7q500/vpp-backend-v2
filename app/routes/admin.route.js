// app/routes/admin.route.js
const express = require("express");
const donHangController = require("../controllers/don-hang.controller");
const nhanVienAuth = require("../middlewares/nhan-vien.auth.middleware");
const phieuNhapController = require("../controllers/phieu-nhap.controller");
const danhGiaController = require("../controllers/danh-gia.controller");
const thongKeController = require("../controllers/thong-ke.controller");
const khachHangController = require("../controllers/khach-hang.controller");
const superAdminAuth = require("../middlewares/super-admin.auth.middleware");
const nhanVienController = require("../controllers/nhan-vien.controller");

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

// === QUẢN LÝ ĐÁNH GIÁ (HẬU KIỂM) ===
router.route("/danh-gia").get(danhGiaController.findAllForAdmin);

router.route("/danh-gia/:id").delete(danhGiaController.deleteForAdmin);

// === THỐNG KÊ DASHBOARD ===
router.get("/thong-ke/tong-quan", thongKeController.getOverview);
router.get("/thong-ke/doanh-thu", thongKeController.getDailyRevenue);

// === QUẢN LÝ KHÁCH HÀNG ===
router.route("/khach-hang").get(khachHangController.findAllForAdmin);

router.route("/khach-hang/:id").delete(khachHangController.deleteForAdmin);
// === QUẢN LÝ NHÂN VIÊN (ÁP DỤNG BẢO VỆ NÂNG CAO) ===
router
  .route("/nhan-vien")
  // Cho phép tất cả nhân viên xem danh sách đồng nghiệp
  .get(nhanVienController.findAll)
  // CHỈ SUPER ADMIN MỚI ĐƯỢC TẠO NHÂN VIÊN MỚI
  .post([superAdminAuth], nhanVienController.create);

router
  .route("/nhan-vien/:id")
  // Cho phép tất cả nhân viên xem thông tin chi tiết của đồng nghiệp
  .get(nhanVienController.findOne)
  // CHỈ SUPER ADMIN MỚI ĐƯỢC SỬA THÔNG TIN NHÂN VIÊN
  .put([superAdminAuth], nhanVienController.update)
  // CHỈ SUPER ADMIN MỚI ĐƯỢC XÓA NHÂN VIÊN
  .delete([superAdminAuth], nhanVienController.delete);

module.exports = router;
