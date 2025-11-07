// app/routes/mau-ma-san-pham.route.js
const express = require("express");
const mauma = require("../controllers/mau-ma-san-pham.controller");
const nhanVienAuth = require("../middlewares/nhan-vien.auth.middleware");

const router = express.Router();

// Tất cả API này đều cần quyền nhân viên
router.use(nhanVienAuth);

router.route("/:id").put(mauma.update).delete(mauma.delete);

module.exports = router;
