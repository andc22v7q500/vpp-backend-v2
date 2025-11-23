// app/services/chat.service.js

class ChatService {
  constructor() {
    // Cơ sở dữ liệu câu hỏi - câu trả lời mẫu
    this.knowledgeBase = [
      {
        keywords: ["xin chào", "hi", "hello", "chào"],
        answer:
          "Chào bạn! 👋 Tôi là trợ lý ảo của VPP-Shop. Tôi có thể giúp gì cho bạn về các sản phẩm văn phòng phẩm ạ?",
      },
      {
        keywords: ["giá", "bao nhiêu", "tiền"],
        answer:
          "Giá sản phẩm bên mình đều được niêm yết công khai trên website ạ. Bạn có thể bấm vào từng sản phẩm để xem chi tiết nhé! 💰",
      },
      {
        keywords: ["bút", "bi", "mực"],
        answer:
          "Bên mình có rất nhiều loại bút: Thiên Long, Hồng Hà, Bến Nghé... Bạn muốn tìm bút bi hay bút nước ạ? 🖊️",
      },
      {
        keywords: ["vở", "tập", "giấy"],
        answer:
          "Shop đang có sẵn các loại vở kẻ ngang, ô ly của Campus, Hồng Hà. Giấy in A4 cũng có đủ loại luôn ạ! 📚",
      },
      {
        keywords: ["ship", "giao hàng", "vận chuyển"],
        answer:
          "VPP-Shop giao hàng toàn quốc! Phí ship sẽ được tính khi bạn đặt hàng. Đơn nội thành thường giao trong 24h ạ. 🚚",
      },
      {
        keywords: ["thanh toán", "trả tiền"],
        answer:
          "Bạn có thể thanh toán khi nhận hàng (COD) hoặc thanh toán Online qua VNPAY nhé! 💳",
      },
      {
        keywords: ["địa chỉ", "shop ở đâu"],
        answer:
          "VPP-Shop hiện bán online là chính. Kho hàng tại Cần Thơ bạn nhé! 🏠",
      },
    ];

    this.defaultAnswer =
      "Xin lỗi, mình chưa hiểu ý bạn lắm. Bạn có thể hỏi về sản phẩm, giá cả, hoặc vận chuyển được không ạ? 🤖";
  }

  async getResponse(userMessage) {
    // 1. Chuyển tin nhắn về chữ thường để dễ so sánh
    const lowerMsg = userMessage.toLowerCase();

    // 2. Tìm câu trả lời phù hợp trong knowledgeBase
    const match = this.knowledgeBase.find((item) => {
      // Kiểm tra xem tin nhắn có chứa từ khóa nào không
      return item.keywords.some((keyword) => lowerMsg.includes(keyword));
    });

    // 3. Giả lập độ trễ (delay) để giống như người đang gõ (500ms - 1.5s)
    const delay = Math.floor(Math.random() * 1000) + 500;

    return new Promise((resolve) => {
      setTimeout(() => {
        if (match) {
          resolve(match.answer);
        } else {
          resolve(this.defaultAnswer);
        }
      }, delay);
    });
  }
}

module.exports = new ChatService();
