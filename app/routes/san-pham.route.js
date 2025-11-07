// app/routes/san-pham.route.js
const express = require("express");
const sanpham = require("../controllers/san-pham.controller");
const nhanVienAuth = require("../middlewares/nhan-vien.auth.middleware");
const mauma = require("../controllers/mau-ma-san-pham.controller");

const router = express.Router();

// API Công khai
router.route("/").get(sanpham.findAll);
router.route("/:id").get(sanpham.findOne);

// API Admin
router.route("/").post([nhanVienAuth], sanpham.create);

router
  .route("/:id")
  .put([nhanVienAuth], sanpham.update)
  .delete([nhanVienAuth], sanpham.delete);

// Tạo mẫu mã cho một sản phẩm cụ thể
router.route("/:productId/mau-ma").post([nhanVienAuth], mauma.create);

module.exports = router;
