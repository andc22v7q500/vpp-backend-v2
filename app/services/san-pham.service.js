// app/services/san-pham.service.js
const pool = require("../config/mysql.config");

class SanPhamService {
  // Hàm tạo mới thông tin chung của sản phẩm
  async create(payload) {
    const { ten_san_pham, mo_ta, ma_danh_muc, ma_thuong_hieu } = payload;
    const sql = `
            INSERT INTO san_pham (ten_san_pham, mo_ta, ma_danh_muc, ma_thuong_hieu) 
            VALUES (?, ?, ?, ?)
        `;
    const [result] = await pool.execute(sql, [
      ten_san_pham,
      mo_ta,
      ma_danh_muc,
      ma_thuong_hieu,
    ]);
    return { id: result.insertId, ...payload };
  }

  // Hàm lấy tất cả sản phẩm (bản tóm tắt)
  async findAll() {
    const sql = `
            SELECT 
                sp.id, sp.ten_san_pham,
                dm.ten_danh_muc, 
                th.ten_thuong_hieu
            FROM san_pham AS sp
            JOIN danh_muc AS dm ON sp.ma_danh_muc = dm.id
            JOIN thuong_hieu AS th ON sp.ma_thuong_hieu = th.id
        `;
    const [rows] = await pool.execute(sql);
    return rows;
  }

  // Hàm tìm một sản phẩm theo ID (lấy đầy đủ chi tiết)
  async findById(id) {
    const connection = await pool.getConnection();
    try {
      // 1. Lấy thông tin sản phẩm gốc
      const [productRows] = await connection.execute(
        `SELECT sp.*, dm.ten_danh_muc, th.ten_thuong_hieu 
                 FROM san_pham AS sp
                 JOIN danh_muc AS dm ON sp.ma_danh_muc = dm.id
                 JOIN thuong_hieu AS th ON sp.ma_thuong_hieu = th.id
                 WHERE sp.id = ?`,
        [id]
      );
      if (productRows.length === 0) return null;
      const product = productRows[0];

      // 2. Lấy danh sách các mẫu mã
      const [mauMaRows] = await connection.execute(
        "SELECT * FROM mau_ma_san_pham WHERE ma_san_pham = ?",
        [id]
      );
      product.mau_ma = mauMaRows;

      // 3. Lấy danh sách hình ảnh
      const [hinhAnhRows] = await connection.execute(
        "SELECT * FROM hinh_anh_san_pham WHERE ma_san_pham = ?",
        [id]
      );
      product.hinh_anh = hinhAnhRows;

      return product;
    } finally {
      connection.release();
    }
  }

  // Hàm cập nhật thông tin chung của sản phẩm
  async update(id, payload) {
    // Lấy thông tin cũ
    const [currentProductRows] = await pool.execute(
      "SELECT * FROM san_pham WHERE id = ?",
      [id]
    );
    if (currentProductRows.length === 0) return null;
    const currentProduct = currentProductRows[0];

    // Trộn dữ liệu cũ và mới
    const updatedProduct = {
      ten_san_pham:
        payload.ten_san_pham !== undefined
          ? payload.ten_san_pham
          : currentProduct.ten_san_pham,
      mo_ta: payload.mo_ta !== undefined ? payload.mo_ta : currentProduct.mo_ta,
      ma_danh_muc:
        payload.ma_danh_muc !== undefined
          ? payload.ma_danh_muc
          : currentProduct.ma_danh_muc,
      ma_thuong_hieu:
        payload.ma_thuong_hieu !== undefined
          ? payload.ma_thuong_hieu
          : currentProduct.ma_thuong_hieu,
    };

    const sql = `
        UPDATE san_pham 
        SET ten_san_pham = ?, mo_ta = ?, ma_danh_muc = ?, ma_thuong_hieu = ? 
        WHERE id = ?
    `;
    await pool.execute(sql, [
      updatedProduct.ten_san_pham,
      updatedProduct.mo_ta,
      updatedProduct.ma_danh_muc,
      updatedProduct.ma_thuong_hieu,
      id,
    ]);
    return this.findById(id);
  }

  // Hàm xóa một sản phẩm
  async delete(id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Xóa các hình ảnh liên quan
      await connection.execute(
        "DELETE FROM hinh_anh_san_pham WHERE ma_san_pham = ?",
        [id]
      );
      // Xóa các mẫu mã liên quan
      await connection.execute(
        "DELETE FROM mau_ma_san_pham WHERE ma_san_pham = ?",
        [id]
      );
      // (Sau này cần xóa cả các đánh giá, chi tiết giỏ hàng... liên quan)

      // Cuối cùng, xóa sản phẩm gốc
      const [result] = await connection.execute(
        "DELETE FROM san_pham WHERE id = ?",
        [id]
      );

      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error; // Ném lỗi ra để controller bắt
    } finally {
      connection.release();
    }
  }
}
module.exports = new SanPhamService();
