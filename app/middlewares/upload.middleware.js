// app/middlewares/upload.middleware.js
const multer = require("multer");
const path = require("path");

// Cấu hình nơi lưu trữ file và tên file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // cb là callback (error, destination)
    cb(null, "public/images/products"); // Lưu file vào thư mục public/images/products
  },
  filename: (req, file, cb) => {
    // Tạo tên file mới để tránh trùng lặp
    // Tên file sẽ là: <tên-gốc>-<timestamp>.<đuôi-file>
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Middleware upload
const upload = multer({ storage: storage });

module.exports = upload;
