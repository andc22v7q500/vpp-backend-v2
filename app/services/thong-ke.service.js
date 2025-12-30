// app/services/thong-ke.service.js

const pool = require("../config/mysql.config");

class ThongKeService {
  /**
   * [ADMIN] Lấy các số liệu tổng quan cho Dashboard.
   */
  async getOverview() {
    const connection = await pool.getConnection();
    try {
      // Chạy song song nhiều câu truy vấn để tăng tốc độ
      const [khachHangResult] = await connection.execute(
        "SELECT COUNT(*) AS total FROM khach_hang"
      );
      const [sanPhamResult] = await connection.execute(
        "SELECT COUNT(*) AS total FROM san_pham"
      );
      const [donHangResult] = await connection.execute(
        "SELECT COUNT(*) AS total FROM don_hang"
      );
      const [doanhThuResult] = await connection.execute(
        "SELECT SUM(tong_tien) AS total FROM don_hang WHERE trang_thai = 'hoan_thanh'"
      );

      return {
        so_luong_khach_hang: khachHangResult[0].total,
        so_luong_san_pham: sanPhamResult[0].total,
        so_luong_don_hang: donHangResult[0].total,
        tong_doanh_thu: doanhThuResult[0].total || 0, // Trả về 0 nếu chưa có doanh thu
      };
    } finally {
      connection.release();
    }
  }

  /**
   * [ADMIN] Thống kê doanh thu theo từng ngày trong một khoảng thời gian.
   */
  async getDailyRevenue(startDate, endDate) {
    const sql = `
            SELECT 
                DATE(ngay_dat) AS ngay,
                SUM(tong_tien) AS doanh_thu
            FROM don_hang
            WHERE 
                trang_thai = 'hoan_thanh' 
                AND DATE(ngay_dat) >= ? 
                AND DATE(ngay_dat) <= ?
            GROUP BY DATE(ngay_dat)
            ORDER BY ngay ASC;
        `;
    const [rows] = await pool.execute(sql, [startDate, endDate]);
    return rows;
  }
}

module.exports = new ThongKeService();
