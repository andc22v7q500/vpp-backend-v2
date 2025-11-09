// app/services/dia-chi.service.js

const pool = require("../config/mysql.config");

class DiaChiService {
  /**
   * Tạo một địa chỉ mới cho một khách hàng cụ thể.
   */
  async create(userId, payload) {
    const {
      ten_nguoi_nhan,
      so_dien_thoai,
      dia_chi_cu_the,
      phuong_xa,
      quan_huyen,
      tinh_thanh,
      la_mac_dinh,
    } = payload;
    const sql = `
            INSERT INTO dia_chi (ma_khach_hang, ten_nguoi_nhan, so_dien_thoai, dia_chi_cu_the, phuong_xa, quan_huyen, tinh_thanh, la_mac_dinh) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
    const [result] = await pool.execute(sql, [
      userId,
      ten_nguoi_nhan,
      so_dien_thoai,
      dia_chi_cu_the,
      phuong_xa,
      quan_huyen,
      tinh_thanh,
      la_mac_dinh || 0,
    ]);
    return { id: result.insertId, ma_khach_hang: userId, ...payload };
  }

  /**
   * Lấy tất cả địa chỉ của một khách hàng.
   */
  async findAllByUserId(userId) {
    const sql = "SELECT * FROM dia_chi WHERE ma_khach_hang = ?";
    const [rows] = await pool.execute(sql, [userId]);
    return rows;
  }

  /**
   * Tìm một địa chỉ cụ thể theo ID, nhưng phải đảm bảo nó thuộc về đúng khách hàng.
   * Cần cho việc đặt hàng.
   */
  async findByIdAndUserId(id, userId) {
    const sql = "SELECT * FROM dia_chi WHERE id = ? AND ma_khach_hang = ?";
    const [rows] = await pool.execute(sql, [id, userId]);
    return rows[0];
  }

  /**
   * Cập nhật một địa chỉ.
   * Phải đảm bảo người cập nhật là chủ sở hữu của địa chỉ đó.
   */
  async update(id, userId, payload) {
    const {
      ten_nguoi_nhan,
      so_dien_thoai,
      dia_chi_cu_the,
      phuong_xa,
      quan_huyen,
      tinh_thanh,
      la_mac_dinh,
    } = payload;
    const sql = `
            UPDATE dia_chi 
            SET ten_nguoi_nhan = ?, so_dien_thoai = ?, dia_chi_cu_the = ?, phuong_xa = ?, quan_huyen = ?, tinh_thanh = ?, la_mac_dinh = ? 
            WHERE id = ? AND ma_khach_hang = ?
        `;
    const [result] = await pool.execute(sql, [
      ten_nguoi_nhan,
      so_dien_thoai,
      dia_chi_cu_the,
      phuong_xa,
      quan_huyen,
      tinh_thanh,
      la_mac_dinh,
      id,
      userId,
    ]);
    return result.affectedRows > 0;
  }

  /**
   * Xóa một địa chỉ.
   * Phải đảm bảo người xóa là chủ sở hữu.
   */
  async delete(id, userId) {
    const sql = "DELETE FROM dia_chi WHERE id = ? AND ma_khach_hang = ?";
    const [result] = await pool.execute(sql, [id, userId]);
    return result.affectedRows > 0;
  }
}

module.exports = new DiaChiService();
