const express = require("express");
const hinhanh = require("../controllers/hinh-anh.controller");
const nhanVienAuth = require("../middlewares/nhan-vien.auth.middleware");
const router = express.Router();

router.delete("/:id", [nhanVienAuth], hinhanh.deleteImage);

module.exports = router;
