// app/services/mau-ma-san-pham.service.js
const pool = require("../config/mysql.config");

class MauMaSanPhamService {
  // Hàm tạo mới một mẫu mã cho một sản phẩm
  async create(productId, payload) {
    const { ten_mau_ma, gia_ban, so_luong_ton } = payload;
    const sql = `
            INSERT INTO mau_ma_san_pham (ma_san_pham, ten_mau_ma, gia_ban, so_luong_ton) 
            VALUES (?, ?, ?, ?)
        `;
    const [result] = await pool.execute(sql, [
      productId,
      ten_mau_ma,
      gia_ban,
      so_luong_ton || 0,
    ]);
    return { id: result.insertId, ma_san_pham: productId, ...payload };
  }

  // Hàm tìm một mẫu mã theo ID (cần cho update)
  async findById(id) {
    const [rows] = await pool.execute(
      "SELECT * FROM mau_ma_san_pham WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  // Hàm cập nhật một mẫu mã
  async update(id, payload) {
    const currentMauMa = await this.findById(id);
    if (!currentMauMa) return null;

    const updatedMauMa = {
      ten_mau_ma:
        payload.ten_mau_ma !== undefined
          ? payload.ten_mau_ma
          : currentMauMa.ten_mau_ma,
      gia_ban:
        payload.gia_ban !== undefined ? payload.gia_ban : currentMauMa.gia_ban,
      so_luong_ton:
        payload.so_luong_ton !== undefined
          ? payload.so_luong_ton
          : currentMauMa.so_luong_ton,
    };

    const sql = `UPDATE mau_ma_san_pham SET ten_mau_ma = ?, gia_ban = ?, so_luong_ton = ? WHERE id = ?`;
    await pool.execute(sql, [
      updatedMauMa.ten_mau_ma,
      updatedMauMa.gia_ban,
      updatedMauMa.so_luong_ton,
      id,
    ]);
    return this.findById(id);
  }

  // Hàm xóa một mẫu mã
  async delete(id) {
    const [result] = await pool.execute(
      "DELETE FROM mau_ma_san_pham WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new MauMaSanPhamService();
