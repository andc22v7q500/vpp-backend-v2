// app/routes/danh-muc.route.js
const express = require("express");
const danhmuc = require("../controllers/danh-muc.controller");

// Import middleware cần thiết
const nhanVienAuth = require("../middlewares/nhan-vien.auth.middleware");

const router = express.Router();

// Route LẤY DỮ LIỆU: Công khai, ai cũng xem được
router.route("/").get(danhmuc.findAll);

router.route("/:id").get(danhmuc.findOne);

// Route THAY ĐỔI DỮ LIỆU: Chỉ nhân viên mới được làm
router.route("/").post([nhanVienAuth], danhmuc.create);

router
  .route("/:id")
  .put([nhanVienAuth], danhmuc.update)
  .delete([nhanVienAuth], danhmuc.delete);
module.exports = router;
