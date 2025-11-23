// app/services/don-hang.service.js
const pool = require("../config/mysql.config");
// KHÔNG CẦN import GioHangService nữa, vì ta sẽ lấy items trực tiếp
const DiaChiService = require("./dia-chi.service");

class DonHangService {
  /**
   * TẠO MỘT ĐƠN HÀNG MỚI TỪ CÁC SẢN PHẨM ĐƯỢC CHỌN TRONG GIỎ
   */
  async createOrder(userId, payload) {
    const { ma_dia_chi, phuong_thuc_thanh_toan, cartItemIds } = payload;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. KIỂM TRA ĐẦU VÀO
      if (!cartItemIds || cartItemIds.length === 0) {
        throw new Error("Vui lòng chọn ít nhất một sản phẩm để đặt hàng.");
      }
      const address = await DiaChiService.findByIdAndUserId(ma_dia_chi, userId);
      if (!address) {
        throw new Error("Địa chỉ giao hàng không hợp lệ.");
      }

      // 2. LẤY THÔNG TIN CHI TIẾT CÁC MÓN HÀNG ĐƯỢC CHỌN
      const placeholders = cartItemIds.map(() => "?").join(","); // Tạo chuỗi ?,?,?
      const getItemsSql = `
                SELECT 
                    ctgh.id, ctgh.so_luong, ctgh.ma_mau_ma,
                    mms.ten_mau_ma, mms.gia_ban,
                    sp.ten_san_pham
                FROM chi_tiet_gio_hang AS ctgh
                JOIN mau_ma_san_pham AS mms ON ctgh.ma_mau_ma = mms.id
                JOIN san_pham AS sp ON mms.ma_san_pham = sp.id
                WHERE ctgh.id IN (${placeholders}) AND ctgh.ma_gio_hang = (SELECT id FROM gio_hang WHERE ma_khach_hang = ?)
            `;
      const [selectedItems] = await connection.execute(getItemsSql, [
        ...cartItemIds,
        userId,
      ]);

      if (selectedItems.length !== cartItemIds.length) {
        throw new Error("Một vài sản phẩm trong giỏ hàng không hợp lệ.");
      }

      // 3. TÍNH TỔNG TIỀN VÀ KIỂM TRA KHO (như cũ)
      let tong_tien = 0;
      for (const item of selectedItems) {
        const [variantRows] = await connection.execute(
          "SELECT so_luong_ton FROM mau_ma_san_pham WHERE id = ? FOR UPDATE",
          [item.ma_mau_ma]
        );
        if (
          variantRows.length === 0 ||
          variantRows[0].so_luong_ton < item.so_luong
        ) {
          throw new Error(
            `Sản phẩm "${item.ten_san_pham} - ${item.ten_mau_ma}" không đủ số lượng tồn kho.`
          );
        }
        tong_tien += item.gia_ban * item.so_luong;
      }

      // 4. ĐÓNG BĂNG ĐỊA CHỈ (như cũ)
      const fullAddressString = `Người nhận: ${address.ten_nguoi_nhan}\nSĐT: ${address.so_dien_thoai}\nĐịa chỉ: ${address.dia_chi_cu_the}, ${address.phuong_xa}, ${address.quan_huyen}, ${address.tinh_thanh}`;

      // 5. TẠO ĐƠN HÀNG (như cũ)
      const [orderResult] = await connection.execute(
        "INSERT INTO don_hang (ma_khach_hang, tong_tien, phuong_thuc_thanh_toan, dia_chi_giao_hang, trang_thai) VALUES (?, ?, ?, ?, 'cho_xac_nhan')",
        [userId, tong_tien, phuong_thuc_thanh_toan, fullAddressString]
      );
      const newOrderId = orderResult.insertId;

      // 6. THÊM CHI TIẾT ĐƠN HÀNG VÀ TRỪ KHO (chỉ với các sản phẩm được chọn)
      const chiTietDonHangValues = selectedItems.map((item) => [
        newOrderId,
        item.ma_mau_ma,
        item.so_luong,
        item.gia_ban,
      ]);
      await connection.query(
        "INSERT INTO chi_tiet_don_hang (ma_don_hang, ma_mau_ma, so_luong, don_gia) VALUES ?",
        [chiTietDonHangValues]
      );
      for (const item of selectedItems) {
        await connection.execute(
          "UPDATE mau_ma_san_pham SET so_luong_ton = so_luong_ton - ? WHERE id = ?",
          [item.so_luong, item.ma_mau_ma]
        );
      }

      // 7. XÓA CÁC SẢN PHẨM ĐÃ MUA KHỎI GIỎ HÀNG
      await connection.query(
        `DELETE FROM chi_tiet_gio_hang WHERE id IN (${placeholders})`,
        cartItemIds
      );

      await connection.commit();
      return {
        orderId: newOrderId,
        message: "Đặt hàng thành công!",
        totalAmount: tong_tien, // <--- Thêm dòng này
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * [ADMIN] Lấy TẤT CẢ đơn hàng trong hệ thống, sắp xếp mới nhất trước.
   */
  async findAll() {
    const sql = `
            SELECT 
                dh.id, 
                dh.ma_khach_hang,
                dh.tong_tien, 
                dh.trang_thai, 
                dh.ngay_dat,
                kh.ho_ten AS ten_khach_hang
            FROM don_hang AS dh
            JOIN khach_hang AS kh ON dh.ma_khach_hang = kh.id
            ORDER BY dh.id DESC
        `;
    const [rows] = await pool.execute(sql);
    return rows;
  }

  /**
   * [ADMIN] Cập nhật trạng thái của một đơn hàng và tạo phiếu xuất nếu cần.
   * Đây là phiên bản "thông minh", linh hoạt nhất.
   */
  async updateStatus(orderId, staffId, newStatus) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Lấy trạng thái CŨ của đơn hàng trước khi cập nhật
      const [orderRows] = await connection.execute(
        "SELECT trang_thai FROM don_hang WHERE id = ? FOR UPDATE",
        [orderId]
      );
      if (orderRows.length === 0) {
        throw new Error("Không tìm thấy đơn hàng.");
      }
      const oldStatus = orderRows[0].trang_thai;

      // Cập nhật trạng thái MỚI
      const sql = "UPDATE don_hang SET trang_thai = ? WHERE id = ?";
      const [result] = await connection.execute(sql, [newStatus, orderId]);

      // LOGIC TẠO PHIẾU XUẤT:
      // Định nghĩa các trạng thái
      const isWaitingStatus = ["cho_thanh_toan", "cho_xac_nhan"].includes(
        oldStatus
      );
      const isProcessingStatus = ["dang_xu_ly", "dang_giao"].includes(
        newStatus
      );

      // Nếu đơn hàng chuyển từ trạng thái "chờ" sang "xử lý"
      if (isWaitingStatus && isProcessingStatus) {
        // Kiểm tra để không tạo phiếu xuất 2 lần
        const [existingPhieuXuat] = await connection.execute(
          "SELECT id FROM phieu_xuat WHERE ma_don_hang = ?",
          [orderId]
        );
        if (existingPhieuXuat.length === 0) {
          console.log(
            `Đơn hàng #${orderId}: Chuyển từ '${oldStatus}' sang '${newStatus}'. Đang tạo phiếu xuất...`
          );
          await connection.execute(
            "INSERT INTO phieu_xuat (ma_don_hang, ma_nhan_vien) VALUES (?, ?)",
            [orderId, staffId]
          );
        }
      }

      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * [USER] Lấy danh sách tất cả đơn hàng của một khách hàng cụ thể.
   */
  async findAllByUserId(userId) {
    // Chỉ lấy các thông tin cần thiết cho danh sách
    const sql = `
            SELECT id, tong_tien, trang_thai, ngay_dat 
            FROM don_hang 
            WHERE ma_khach_hang = ? 
            ORDER BY id DESC
        `;
    const [rows] = await pool.execute(sql, [userId]);
    return rows;
  }

  /**
   * [USER] Lấy thông tin chi tiết của một đơn hàng, đảm bảo nó thuộc về đúng người dùng.
   */
  async findOneByUserId(userId, orderId) {
    const connection = await pool.getConnection();
    try {
      // 1. Lấy thông tin đơn hàng gốc
      const [orderRows] = await connection.execute(
        "SELECT * FROM don_hang WHERE id = ? AND ma_khach_hang = ?",
        [orderId, userId]
      );
      if (orderRows.length === 0) return null; // Không tìm thấy hoặc không có quyền
      const order = orderRows[0];

      // 2. Lấy chi tiết các sản phẩm trong đơn hàng
      const sqlDetails = `
                SELECT 
                    ctdh.*, 
                    mms.ten_mau_ma, 
                    sp.ten_san_pham,
                    (SELECT url_hinh_anh FROM hinh_anh_san_pham WHERE ma_san_pham = sp.id LIMIT 1) AS hinh_anh_dai_dien
                FROM chi_tiet_don_hang AS ctdh
                JOIN mau_ma_san_pham AS mms ON ctdh.ma_mau_ma = mms.id
                JOIN san_pham AS sp ON mms.ma_san_pham = sp.id
                WHERE ctdh.ma_don_hang = ?
            `;
      const [detailRows] = await connection.execute(sqlDetails, [orderId]);
      order.chi_tiet = detailRows;

      return order;
    } finally {
      connection.release();
    }
  }
}

module.exports = new DonHangService();
