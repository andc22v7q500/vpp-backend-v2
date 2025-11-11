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

  // (Các hàm cho Admin sẽ được đặt ở đây sau)
}

module.exports = new DanhGiaService();
