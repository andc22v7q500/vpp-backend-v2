// app/services/danh-gia.service.js
const pool = require("../config/mysql.config");

class DanhGiaService {
  /**
   * [USER] Tạo một đánh giá mới.
   * Cần kiểm tra xem người dùng đã mua sản phẩm này chưa.
   */
  async create(userId, productId, payload) {
    const { so_sao, binh_luan } = payload;

    // KIỂM TRA LOGIC NGHIỆP VỤ: User đã mua sản phẩm này chưa?
    const checkPurchaseSql = `
            SELECT COUNT(*) AS count
            FROM don_hang dh
            JOIN chi_tiet_don_hang ctdh ON dh.id = ctdh.ma_don_hang
            JOIN mau_ma_san_pham mms ON ctdh.ma_mau_ma = mms.id
            WHERE dh.ma_khach_hang = ? AND mms.ma_san_pham = ? AND dh.trang_thai = 'hoan_thanh'
        `;
    const [purchaseRows] = await pool.execute(checkPurchaseSql, [
      userId,
      productId,
    ]);
    if (purchaseRows[0].count === 0) {
      // Nếu chưa mua hoặc đơn hàng chưa hoàn thành, không cho đánh giá
      return {
        error: 403,
        message:
          "Bạn chỉ có thể đánh giá những sản phẩm đã mua và đơn hàng đã hoàn thành.",
      };
    }

    const insertSql = `
            INSERT INTO danh_gia_san_pham (ma_khach_hang, ma_san_pham, so_sao, binh_luan)
            VALUES (?, ?, ?, ?)
        `;
    const [result] = await pool.execute(insertSql, [
      userId,
      productId,
      so_sao,
      binh_luan,
    ]);
    return { id: result.insertId, ...payload };
  }

  /**
   * [ADMIN] Lấy tất cả các đánh giá trong hệ thống.
   * JOIN để lấy thêm tên khách hàng và tên sản phẩm cho dễ hiển thị.
   */
  async findAll() {
    const sql = `
            SELECT 
                dg.id, dg.so_sao, dg.binh_luan, dg.ngay_tao,
                kh.ho_ten AS ten_khach_hang,
                sp.ten_san_pham
            FROM danh_gia_san_pham AS dg
            JOIN khach_hang AS kh ON dg.ma_khach_hang = kh.id
            JOIN san_pham AS sp ON dg.ma_san_pham = sp.id
            ORDER BY dg.id DESC
        `;
    const [rows] = await pool.execute(sql);
    return rows;
  }

  /**
   * [ADMIN] Xóa một đánh giá dựa trên ID.
   */
  async delete(id) {
    const [result] = await pool.execute(
      "DELETE FROM danh_gia_san_pham WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }
  async checkUserPermission(userId, productId) {
    const sql = `
        SELECT COUNT(*) AS count
        FROM don_hang dh
        JOIN chi_tiet_don_hang ctdh ON dh.id = ctdh.ma_don_hang
        JOIN mau_ma_san_pham mms ON ctdh.ma_mau_ma = mms.id
        WHERE dh.ma_khach_hang = ? AND mms.ma_san_pham = ? AND dh.trang_thai = 'hoan_thanh'
    `;
    const [rows] = await pool.execute(sql, [userId, productId]);
    return rows[0].count > 0;
  }
}

module.exports = new DanhGiaService();
