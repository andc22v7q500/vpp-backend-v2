const express = require("express");
const donhang = require("../controllers/don-hang.controller");
const khachHangAuth = require("../middlewares/khach-hang.auth.middleware");

const router = express.Router();
router.use(khachHangAuth);
router
  .route("/")
  .post(donhang.create) // Tạo đơn hàng mới
  .get(donhang.findAllForUser); // Lấy lịch sử đơn hàng

router.route("/:id").get(donhang.findOneForUser); // Lấy chi tiết một đơn hàng
module.exports = router;
