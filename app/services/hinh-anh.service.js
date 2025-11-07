const pool = require("../config/mysql.config");

class HinhAnhService {
  // Thêm một hoặc nhiều hình ảnh cho sản phẩm
  async addImages(productId, files) {
    if (!files || files.length === 0) {
      return [];
    }
    const sql =
      "INSERT INTO hinh_anh_san_pham (ma_san_pham, url_hinh_anh) VALUES ?";
    // `files` là một mảng object từ multer, mỗi object có thuộc tính `path`
    // `path` sẽ là 'public\\images\\products\\...'
    // Ta cần chuẩn hóa lại đường dẫn cho đúng
    const values = files.map((file) => [
      productId,
      file.path.replace(/\\/g, "/"),
    ]);

    await pool.query(sql, [values]);

    // Trả về danh sách hình ảnh mới của sản phẩm
    const [newImages] = await pool.execute(
      "SELECT * FROM hinh_anh_san_pham WHERE ma_san_pham = ?",
      [productId]
    );
    return newImages;
  }

  // Xóa một hình ảnh
  async deleteImage(id) {
    // (Trong thực tế cần xóa cả file ảnh trên server, nhưng để đơn giản ta chỉ xóa trong CSDL)
    const [result] = await pool.execute(
      "DELETE FROM hinh_anh_san_pham WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }
}
module.exports = new HinhAnhService();
