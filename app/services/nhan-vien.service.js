// app/services/nhan-vien.service.js

const pool = require("../config/mysql.config");

class NhanVienService {
  /**
   * [ADMIN] Tạo mới một nhân viên.
   * Mật khẩu truyền vào đây đã được hash.
   */
  async create(payload) {
    const { ho_ten, email, mat_khau } = payload;
    const sql = `INSERT INTO nhan_vien (ho_ten, email, mat_khau) VALUES (?, ?, ?)`;
    const [result] = await pool.execute(sql, [ho_ten, email, mat_khau]);
    const newUser = { id: result.insertId, ...payload };
    delete newUser.mat_khau; // Không trả về mật khẩu
    return newUser;
  }

  /**
   * Tìm nhân viên theo email (Dùng cho cả đăng nhập và kiểm tra trùng lặp).
   * Phải lấy cả mật khẩu.
   */
  async findByEmail(email) {
    const [rows] = await pool.execute(
      "SELECT * FROM nhan_vien WHERE email = ?",
      [email]
    );
    return rows[0];
  }

  /**
   * [ADMIN] Lấy tất cả nhân viên (không lấy mật khẩu).
   */
  async findAll() {
    const [rows] = await pool.execute(
      "SELECT id, ho_ten, email FROM nhan_vien"
    );
    return rows;
  }

  /**
   * [ADMIN] Lấy chi tiết một nhân viên (không lấy mật khẩu).
   */
  async findById(id) {
    const [rows] = await pool.execute(
      "SELECT id, ho_ten, email FROM nhan_vien WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  /**
   * [ADMIN] Cập nhật thông tin nhân viên (chỉ họ tên).
   */
  async update(id, payload) {
    const { ho_ten } = payload;
    const sql = "UPDATE nhan_vien SET ho_ten = ? WHERE id = ?";
    await pool.execute(sql, [ho_ten, id]);
    return this.findById(id);
  }

  /**
   * [ADMIN] Xóa một nhân viên.
   */
  async delete(id) {
    const [result] = await pool.execute("DELETE FROM nhan_vien WHERE id = ?", [
      id,
    ]);
    return result.affectedRows > 0;
  }
}

module.exports = new NhanVienService();
