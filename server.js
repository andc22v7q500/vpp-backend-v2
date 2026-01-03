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
// Lưu danh sách khách hàng đang cần hỗ trợ
// Cấu trúc: { 'socketId': { id: '...', name: '...' } }
const activeUsers = {};
const chattingWithHuman = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // 1. Admin đăng nhập vào hệ thống chat
  socket.on("admin-join", () => {
    socket.join("admin-room"); // Gom tất cả admin vào một phòng
    console.log("Admin joined chat room");
    // Gửi danh sách user đang online cho Admin mới vào
    socket.emit("update-user-list", activeUsers);
  });

  // 2. Khách hàng gửi tin nhắn
  socket.on("chat-message", async (msg) => {
    // Lưu thông tin khách hàng (đơn giản hóa, lấy socket.id làm định danh)
    if (!activeUsers[socket.id]) {
      activeUsers[socket.id] = {
        id: socket.id,
        name: `Khách ${socket.id.substr(0, 4)}`,
        hasNew: true,
      };
      // Báo cho Admin biết có khách mới
      io.to("admin-room").emit("update-user-list", activeUsers);
    }

    // Gửi tin nhắn cho Admin
    io.to("admin-room").emit("message-from-user", {
      userId: socket.id,
      text: msg,
      time: new Date().toLocaleTimeString(),
    });
    if (!chattingWithHuman[socket.id]) {
      const botReply = await ChatService.getResponse(msg);
      socket.emit("bot-reply", botReply);
    }

    // const botReply = await ChatService.getResponse(msg);
    // socket.emit("bot-reply", botReply);
  });

  // 3. Admin trả lời lại
  socket.on("admin-reply", (data) => {
    const { targetUserId, text } = data;
    chattingWithHuman[targetUserId] = true;
    // Gửi riêng cho khách hàng đó
    io.to(targetUserId).emit("bot-reply", `(Nhân viên): ${text}`);
  });

  // 4. Khách hàng thoát
  socket.on("disconnect", () => {
    delete activeUsers[socket.id];
    delete chattingWithHuman[socket.id];
    io.to("admin-room").emit("update-user-list", activeUsers);
  });
});
// Start server
const PORT = config.app.port;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
  console.log(`Socket.IO is ready.`);
});
