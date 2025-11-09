// app/services/gio-hang.service.js
const pool = require("../config/mysql.config");

class GioHangService {
  /**
   * Tìm hoặc Tạo giỏ hàng cho một khách hàng.
   * Mỗi khách hàng chỉ có 1 giỏ hàng (do ràng buộc UNIQUE trong CSDL).
   */
  async findOrCreateCart(customerId) {
    // Thử tìm giỏ hàng trước
    let [cartRows] = await pool.execute(
      "SELECT * FROM gio_hang WHERE ma_khach_hang = ?",
      [customerId]
    );

    if (cartRows.length > 0) {
      return cartRows[0]; // Trả về giỏ hàng đã có
    } else {
      // Nếu chưa có, tạo mới
      const [result] = await pool.execute(
        "INSERT INTO gio_hang (ma_khach_hang) VALUES (?)",
        [customerId]
      );
      return { id: result.insertId, ma_khach_hang: customerId };
    }
  }

  /**
   * Thêm một sản phẩm vào giỏ hàng hoặc cập nhật số lượng nếu đã tồn tại.
   */
  async addItem(cartId, mauMaId, soLuong) {
    // Kiểm tra xem sản phẩm đã có trong chi_tiet_gio_hang chưa
    const [existingItem] = await pool.execute(
      "SELECT * FROM chi_tiet_gio_hang WHERE ma_gio_hang = ? AND ma_mau_ma = ?",
      [cartId, mauMaId]
    );

    if (existingItem.length > 0) {
      // Nếu đã có, cộng dồn số lượng
      const newQuantity = existingItem[0].so_luong + soLuong;
      await pool.execute(
        "UPDATE chi_tiet_gio_hang SET so_luong = ? WHERE id = ?",
        [newQuantity, existingItem[0].id]
      );
    } else {
      // Nếu chưa có, thêm mới
      await pool.execute(
        "INSERT INTO chi_tiet_gio_hang (ma_gio_hang, ma_mau_ma, so_luong) VALUES (?, ?, ?)",
        [cartId, mauMaId, soLuong]
      );
    }
  }

  /**
   * Lấy toàn bộ thông tin chi tiết của một giỏ hàng.
   * Dùng JOIN để lấy cả thông tin sản phẩm và mẫu mã.
   */
  async getCartDetails(cartId) {
    const sql = `
            SELECT 
                ctgh.id,
                ctgh.so_luong,
                ctgh.ma_mau_ma,
                mms.ten_mau_ma,
                mms.gia_ban,
                sp.ten_san_pham,
                (SELECT url_hinh_anh FROM hinh_anh_san_pham WHERE ma_san_pham = sp.id LIMIT 1) AS hinh_anh_dai_dien
            FROM chi_tiet_gio_hang AS ctgh
            JOIN mau_ma_san_pham AS mms ON ctgh.ma_mau_ma = mms.id
            JOIN san_pham AS sp ON mms.ma_san_pham = sp.id
            WHERE ctgh.ma_gio_hang = ?
        `;
    const [items] = await pool.execute(sql, [cartId]);
    return items;
  }

  /**
   * Cập nhật số lượng của một item trong giỏ hàng.
   * `cartItemId` là id của bảng `chi_tiet_gio_hang`.
   */
  async updateItemQuantity(cartItemId, soLuong) {
    if (soLuong <= 0) {
      // Nếu số lượng <= 0 thì xóa luôn
      return this.removeItem(cartItemId);
    }
    const [result] = await pool.execute(
      "UPDATE chi_tiet_gio_hang SET so_luong = ? WHERE id = ?",
      [soLuong, cartItemId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Xóa một item khỏi giỏ hàng.
   * `cartItemId` là id của bảng `chi_tiet_gio_hang`.
   */
  async removeItem(cartItemId) {
    const [result] = await pool.execute(
      "DELETE FROM chi_tiet_gio_hang WHERE id = ?",
      [cartItemId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new GioHangService();
