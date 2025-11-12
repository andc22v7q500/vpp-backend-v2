// app/services/khach-hang.service.js

const pool = require("../config/mysql.config");

class KhachHangService {
  /**
   * Tạo một khách hàng mới.
   * Mật khẩu truyền vào đây đã được hash ở tầng controller.
   */
  async create(payload) {
    // Chỉ lấy những trường có trong bảng khach_hang
    const { ho_ten, email, mat_khau, so_dien_thoai } = payload;

    // Câu lệnh SQL mới chỉ có 4 cột (đã bỏ vai_tro)
    const sql = `
            INSERT INTO khach_hang (ho_ten, email, mat_khau, so_dien_thoai) 
            VALUES (?, ?, ?, ?)
        `;

    // Mảng giá trị cũng chỉ còn 4 phần tử
    const [result] = await pool.execute(sql, [
      ho_ten,
      email,
      mat_khau,
      so_dien_thoai || null, // Nếu không có sđt thì truyền NULL
    ]);

    return { id: result.insertId, ...payload };
  }

  /**
   * Tìm khách hàng theo ID.
   * Dùng để lấy profile, không trả về mật khẩu.
   */
  async findById(id) {
    // Câu SELECT đã bỏ cột vai_tro
    const [rows] = await pool.execute(
      "SELECT id, ho_ten, email, so_dien_thoai FROM khach_hang WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  /**
   * Tìm khách hàng theo email.
   * Dùng cho việc đăng nhập và kiểm tra email trùng, PHẢI lấy cả mật khẩu.
   */
  async findByEmail(email) {
    // Dùng SELECT * để lấy tất cả các cột
    const [rows] = await pool.execute(
      "SELECT * FROM khach_hang WHERE email = ?",
      [email]
    );
    return rows[0];
  }

  /**
   * Cập nhật thông tin profile cho khách hàng.
   * Không cho phép cập nhật email hay mật khẩu ở hàm này.
   */
  async updateProfile(id, payload) {
    // Lấy thông tin cũ để điền vào những trường không được cập nhật
    const [currentUserRows] = await pool.execute(
      "SELECT * FROM khach_hang WHERE id = ?",
      [id]
    );
    if (currentUserRows.length === 0) return null;
    const currentUser = currentUserRows[0];

    // Chỉ cho phép cập nhật họ tên và số điện thoại
    const updatedUser = {
      ho_ten:
        payload.ho_ten !== undefined ? payload.ho_ten : currentUser.ho_ten,
      so_dien_thoai:
        payload.so_dien_thoai !== undefined
          ? payload.so_dien_thoai
          : currentUser.so_dien_thoai,
    };

    const sql =
      "UPDATE khach_hang SET ho_ten = ?, so_dien_thoai = ? WHERE id = ?";

    await pool.execute(sql, [
      updatedUser.ho_ten,
      updatedUser.so_dien_thoai,
      id,
    ]);

    return this.findById(id); // Trả về thông tin mới nhất (không có mật khẩu)
  }

  // Các hàm khác dành cho Admin quản lý (nếu cần)
  async findAll() {
    const [rows] = await pool.execute(
      "SELECT id, ho_ten, email, so_dien_thoai FROM khach_hang"
    );
    return rows;
  }

  async delete(id) {
    const [result] = await pool.execute("DELETE FROM khach_hang WHERE id = ?", [
      id,
    ]);
    return result.affectedRows > 0;
  }

  /**
   * [ADMIN] Lấy danh sách tất cả khách hàng (không lấy mật khẩu).
   */
  async findAll() {
    const [rows] = await pool.execute(
      "SELECT id, ho_ten, email, so_dien_thoai FROM khach_hang"
    );
    return rows;
  }

  /**
   * [ADMIN] Xóa một khách hàng.
   * Cần cẩn thận vì nó sẽ gây lỗi nếu khách hàng này đã có đơn hàng (do ràng buộc khóa ngoại).
   * Trong thực tế, ta thường không xóa cứng mà chỉ "vô hiệu hóa".
   * Nhưng trong phạm vi tiểu luận, xóa cứng là chấp nhận được.
   */
  async delete(id) {
    // Transaction để đảm bảo xóa các dữ liệu liên quan
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Xóa các dữ liệu phụ thuộc trước
      await connection.execute(
        "DELETE FROM danh_gia_san_pham WHERE ma_khach_hang = ?",
        [id]
      );
      await connection.execute("DELETE FROM dia_chi WHERE ma_khach_hang = ?", [
        id,
      ]);
      // Lưu ý: Đơn hàng là lịch sử quan trọng, thường không xóa. Nếu muốn xóa, phải xóa chi_tiet_don_hang trước.
      // Để đơn giản, ta sẽ không xóa đơn hàng liên quan. Nếu CSDL có ràng buộc ON DELETE RESTRICT, lệnh xóa khách hàng sẽ thất bại nếu họ có đơn hàng.

      // Xóa giỏ hàng
      const [cart] = await connection.execute(
        "SELECT id FROM gio_hang WHERE ma_khach_hang = ?",
        [id]
      );
      if (cart.length > 0) {
        await connection.execute(
          "DELETE FROM chi_tiet_gio_hang WHERE ma_gio_hang = ?",
          [cart[0].id]
        );
        await connection.execute(
          "DELETE FROM gio_hang WHERE ma_khach_hang = ?",
          [id]
        );
      }

      // Cuối cùng, xóa khách hàng
      const [result] = await connection.execute(
        "DELETE FROM khach_hang WHERE id = ?",
        [id]
      );

      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      // Nếu lỗi do khóa ngoại (khách đã có đơn hàng), trả về thông báo thân thiện
      if (error.code === "ER_ROW_IS_REFERENCED_2") {
        throw new ApiError(
          409,
          "Không thể xóa khách hàng này vì đã có lịch sử đơn hàng."
        );
      }
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new KhachHangService();
