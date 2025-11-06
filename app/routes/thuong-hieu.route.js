// app/routes/thuong-hieu.route.js
const express = require("express");
const thuonghieu = require("../controllers/thuong-hieu.controller");

// Import middleware cần thiết
const nhanVienAuth = require("../middlewares/nhan-vien.auth.middleware");

const router = express.Router();

// Route LẤY DỮ LIỆU: Công khai
router.route("/").get(thuonghieu.findAll);

router.route("/:id").get(thuonghieu.findOne);

// Route THAY ĐỔI DỮ LIỆU: Chỉ nhân viên
router.route("/").post([nhanVienAuth], thuonghieu.create);

router
  .route("/:id")
  .put([nhanVienAuth], thuonghieu.update)
  .delete([nhanVienAuth], thuonghieu.delete);

module.exports = router;
