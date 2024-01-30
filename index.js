const io = require("socket.io")(8800, {
  cors: {
    origin: ["https://fakebook-by-triloki.netlify.app", "http://localhost:3000"],
  },
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

io.on("connection", (socket) => {
  console.log("user connected");

  // on connect
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUser", users); // emit users list
  });

  //   send and get msg
  socket.on("sendMsg", ({ senderId, receiverId, data }) => {
    const user = users.find((user) => user.userId == receiverId);
    io.to(user?.socketId).emit("getMsg", data);
  });

  // Notification
  socket.on("Notification", (data) => {
    const user = users.find((user) => user.userId === data.receiverId);
    io.to(user?.socketId).emit("Notification", data);
  });

  // friend-request
  socket.on("send-friendRequest", (data) => {
    const user = users.find((user) => user.userId === data.userId);
    io.to(user?.socketId).emit("get-friendRequest");
  });

  //******calling************

  socket.on("callUser", ({ friendId, signal, from, audio, video }) => {
    const friend = users.find((user) => user.userId === friendId);
		io.to(friend?.socketId).emit("callUser", { signal, from, audio:audio, video:video});
	});

	socket.on("answerCall", (data) => {
    const user = users.find((user) => user.userId === data.to);
		io.to(user?.socketId).emit("callAccepted", data.signal)
	});

  socket.on("endCall",({friendId})=>{
    const friend = users.find((user) => user.userId === friendId);
    io.to(friend?.socketId).emit("endCall");
  })

  // on disconnect
  socket.on("disconnect", () => {
    console.log("user disconnected");
    removeUser(socket.id);
    io.emit("getUser", users);
  });
});
