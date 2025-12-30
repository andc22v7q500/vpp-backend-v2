// app/routes/vnpay.route.js
const express = require("express");
const vnpayController = require("../controllers/vnpay.controller");
const router = express.Router();

// Route này công khai, không cần đăng nhập, vì VNPAY trả về sẽ không có token
router.get("/vnpay_return", vnpayController.vnpayReturn);

module.exports = router;
