// app/routes/danh-gia.route.js

const express = require("express");
const danhgia = require("../controllers/danh-gia.controller");
const khachHangAuth = require("../middlewares/khach-hang.auth.middleware");

const router = express.Router();

// Route này chỉ dành cho khách hàng đã đăng nhập
router.use(khachHangAuth);

// Endpoint rất logic: "Gửi một đánh giá cho một sản phẩm cụ thể"
router.route("/san-pham/:productId").post(danhgia.create);

router.get("/san-pham/:productId/permission", danhgia.checkPermission);

module.exports = router;
