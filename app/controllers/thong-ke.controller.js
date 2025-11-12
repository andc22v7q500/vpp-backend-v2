// app/controllers/thong-ke.controller.js

const ThongKeService = require("../services/thong-ke.service");
const ApiError = require("../api-error");

exports.getOverview = async (req, res, next) => {
  try {
    const overviewData = await ThongKeService.getOverview();
    return res.send(overviewData);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy dữ liệu thống kê tổng quan."));
  }
};

exports.getDailyRevenue = async (req, res, next) => {
  try {
    // Lấy ngày bắt đầu và kết thúc từ query string
    // Ví dụ: /api/admin/thong-ke/doanh-thu?start=2024-01-01&end=2024-01-31
    const { start, end } = req.query;
    if (!start || !end) {
      return next(
        new ApiError(400, "Ngày bắt đầu và ngày kết thúc là bắt buộc.")
      );
    }

    const revenueData = await ThongKeService.getDailyRevenue(start, end);
    return res.send(revenueData);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy dữ liệu thống kê doanh thu."));
  }
};
