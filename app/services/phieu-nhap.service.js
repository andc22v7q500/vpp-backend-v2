// app/services/phieu-nhap.service.js

const pool = require("../config/mysql.config");

class PhieuNhapService {
  /**
   * [ADMIN] Tạo một phiếu nhập mới và cập nhật tồn kho.
   */
  async create(staffId, payload) {
    const { ghi_chu, chi_tiet } = payload;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. KIỂM TRA ĐẦU VÀO
      if (!chi_tiet || chi_tiet.length === 0) {
        throw new Error("Chi tiết phiếu nhập không được để trống.");
      }

      // 2. TẠO PHIẾU NHẬP
      const [phieuNhapResult] = await connection.execute(
        "INSERT INTO phieu_nhap (ma_nhan_vien, ghi_chu) VALUES (?, ?)",
        [staffId, ghi_chu || null]
      );
      const newPhieuNhapId = phieuNhapResult.insertId;

      // 3. LẶP QUA CHI TIẾT ĐỂ THÊM VÀO `chi_tiet_phieu_nhap` VÀ CỘNG TỒN KHO
      const chiTietValues = [];
      for (const item of chi_tiet) {
        // Thêm vào mảng để INSERT hàng loạt
        chiTietValues.push([
          newPhieuNhapId,
          item.ma_mau_ma,
          item.so_luong_nhap,
          item.gia_nhap,
        ]);

        // Cộng vào số lượng tồn kho
        await connection.execute(
          "UPDATE mau_ma_san_pham SET so_luong_ton = so_luong_ton + ? WHERE id = ?",
          [item.so_luong_nhap, item.ma_mau_ma]
        );
      }
      // INSERT hàng loạt vào chi_tiet_phieu_nhap
      await connection.query(
        "INSERT INTO chi_tiet_phieu_nhap (ma_phieu_nhap, ma_mau_ma, so_luong_nhap, gia_nhap) VALUES ?",
        [chiTietValues]
      );

      await connection.commit();
      return { id: newPhieuNhapId, ...payload };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * [ADMIN] Lấy danh sách tất cả các phiếu nhập.
   */
  async findAll() {
    const sql = `
            SELECT pn.*, nv.ho_ten AS ten_nhan_vien
            FROM phieu_nhap AS pn
            JOIN nhan_vien AS nv ON pn.ma_nhan_vien = nv.id
            ORDER BY pn.id DESC
        `;
    const [rows] = await pool.execute(sql);
    return rows;
  }

  /**
   * [ADMIN] Lấy chi tiết một phiếu nhập, bao gồm cả các sản phẩm đã nhập.
   */
  async findById(id) {
    const connection = await pool.getConnection();
    try {
      // Lấy thông tin phiếu nhập gốc
      const [phieuNhapRows] = await connection.execute(
        `SELECT pn.*, nv.ho_ten AS ten_nhan_vien
                 FROM phieu_nhap AS pn
                 JOIN nhan_vien AS nv ON pn.ma_nhan_vien = nv.id
                 WHERE pn.id = ?`,
        [id]
      );
      if (phieuNhapRows.length === 0) return null;
      const phieuNhap = phieuNhapRows[0];

      // Lấy chi tiết các sản phẩm đã nhập
      const sqlDetails = `
                SELECT ctpn.*, mms.ten_mau_ma, sp.ten_san_pham
                FROM chi_tiet_phieu_nhap AS ctpn
                JOIN mau_ma_san_pham AS mms ON ctpn.ma_mau_ma = mms.id
                JOIN san_pham AS sp ON mms.ma_san_pham = sp.id
                WHERE ctpn.ma_phieu_nhap = ?
            `;
      const [detailRows] = await connection.execute(sqlDetails, [id]);
      phieuNhap.chi_tiet = detailRows;

      return phieuNhap;
    } finally {
      connection.release();
    }
  }
}

module.exports = new PhieuNhapService();
