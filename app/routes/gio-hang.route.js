// app/routes/gio-hang.route.js
const express = require("express");
const giohang = require("../controllers/gio-hang.controller");
const khachHangAuth = require("../middlewares/khach-hang.auth.middleware");
const router = express.Router();

router.use(khachHangAuth); // Bảo vệ tất cả các API giỏ hàng

router.route("/").get(giohang.getCart).post(giohang.addItemToCart);

// :itemId là id của dòng trong bảng chi_tiet_gio_hang
router
  .route("/items/:itemId")
  .put(giohang.updateCartItem)
  .delete(giohang.removeCartItem);

module.exports = router;
