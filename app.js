const express = require("express");
const cors = require("cors");
const ApiError = require("./app/api-error");
const path = require("path");

const app = express();
const authRouter = require("./app/routes/auth.route");
const danhMucRouter = require("./app/routes/danh-muc.route");
const thuongHieuRouter = require("./app/routes/thuong-hieu.route");
const sanPhamRouter = require("./app/routes/san-pham.route");
const mauMaRouter = require("./app/routes/mau-ma-san-pham.route");
const hinhAnhRouter = require("./app/routes/hinh-anh.route");
const khachHangRouter = require("./app/routes/khach-hang.route");
const diaChiRouter = require("./app/routes/dia-chi.route");
const gioHangRouter = require("./app/routes/gio-hang.route");
const donHangRouter = require("./app/routes/don-hang.route");
const adminRouter = require("./app/routes/admin.route");
const danhGiaRouter = require("./app/routes/danh-gia.route");

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/danh-muc", danhMucRouter);
app.use("/api/thuong-hieu", thuongHieuRouter);
app.use("/api/san-pham", sanPhamRouter);
app.use("/api/mau-ma", mauMaRouter);
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/api/hinh-anh", hinhAnhRouter);
app.use("/api/khach-hang", khachHangRouter);
app.use("/api/dia-chi", diaChiRouter);
app.use("/api/gio-hang", gioHangRouter);
app.use("/api/don-hang", donHangRouter);
app.use("/api/admin", adminRouter);
app.use("/api/danh-gia", danhGiaRouter);

app.get("/", (req, res) => {
  res.json({ message: "Website bán hàng văn phòng phẩm" });
});

// handle 404 response
app.use((req, res, next) => {
  // Code ở đây sẽ chạy khi không có route được định nghĩa nào
  // khớp với yêu cầu. Gọi next() để chuyển sang middleware xử lý lỗi
  return next(new ApiError(404, "Resource not found"));
});

// define error-handling middleware last, after other app.use() and routes calls
app.use((err, req, res, next) => {
  // Middleware xử lý lỗi tập trung.
  // Trong các đoạn code xử lý ở các route, gọi next(error) sẽ chuyển về middleware xử lý lỗi này
  return res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
});
module.exports = app;
