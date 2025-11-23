require("dotenv").config();

const app = require("./app");
const config = require("./app/config");
const http = require("http"); // Import module http
const { Server } = require("socket.io"); // Import socket.io
const ChatService = require("./app/services/chat.service"); // Import service chat

// Tạo HTTP server từ Express app
const httpServer = http.createServer(app);

// Khởi tạo Socket.IO server gắn vào HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Cho phép mọi trang web kết nối (để test cho dễ)
    methods: ["GET", "POST"],
  },
});

// Lắng nghe kết nối từ client
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Khi nhận được tin nhắn từ client (sự kiện 'chat-message')
  socket.on("chat-message", async (msg) => {
    console.log("User says:", msg);

    // 1. Gửi tin nhắn của user sang Gemini để lấy câu trả lời
    const botReply = await ChatService.getResponse(msg);

    // 2. Gửi câu trả lời của Bot ngược lại cho client (sự kiện 'bot-reply')
    socket.emit("bot-reply", botReply);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Start server (Lưu ý dùng httpServer.listen chứ không phải app.listen)
const PORT = config.app.port;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
  console.log(`Socket.IO is ready.`);
});
