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
}

module.exports = new KhachHangService();
