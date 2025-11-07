// app/routes/san-pham.route.js
const express = require("express");
const sanpham = require("../controllers/san-pham.controller");
const nhanVienAuth = require("../middlewares/nhan-vien.auth.middleware");

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

module.exports = router;
