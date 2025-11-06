// app/services/thuong-hieu.service.js
const pool = require("../config/mysql.config");

class ThuongHieuService {
  async create(payload) {
    const [result] = await pool.execute(
      "INSERT INTO thuong_hieu (ten_thuong_hieu) VALUES (?)",
      [payload.ten_thuong_hieu]
    );
    return { id: result.insertId, ...payload };
  }

  async findAll() {
    const [rows] = await pool.execute("SELECT * FROM thuong_hieu");
    return rows;
  }

  // Hàm tìm một thương hiệu theo ID
  async findById(id) {
    const [rows] = await pool.execute(
      "SELECT * FROM thuong_hieu WHERE id = ?",
      [id]
    );
    return rows[0]; // Trả về object đầu tiên trong mảng kết quả
  }
  async update(id, payload) {
    const sql = "UPDATE thuong_hieu SET ten_thuong_hieu = ? WHERE id = ?";
    await pool.execute(sql, [payload.ten_thuong_hieu, id]);
    // Trả về dữ liệu đã được cập nhật
    return this.findById(id);
  }

  // Hàm xóa một thương hiệu
  async delete(id) {
    const [result] = await pool.execute(
      "DELETE FROM thuong_hieu WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0; // Trả về true nếu xóa thành công, false nếu không
  }
}
module.exports = new ThuongHieuService();
