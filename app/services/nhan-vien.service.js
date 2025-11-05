// app/services/nhan-vien.service.js

const pool = require("../config/mysql.config");

class NhanVienService {
  /**
   * Tìm nhân viên theo email.
   * Dùng cho việc đăng nhập, PHẢI lấy cả mật khẩu.
   */
  async findByEmail(email) {
    const [rows] = await pool.execute(
      "SELECT * FROM nhan_vien WHERE email = ?",
      [email]
    );
    return rows[0];
  }
}

module.exports = new NhanVienService();
