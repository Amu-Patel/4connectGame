const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("✅ Connected to backend:", socket.id);

  // Ask for match
  socket.emit("find_match");
});

socket.on("waiting", () => {
  console.log("⏳ Waiting for opponent...");
});

socket.on("join", (data) => {
  console.log("🎮 Joined game:", data);

  // Make a move after join
  setTimeout(() => {
    socket.emit("move", {
      roomId: data.roomId,
      col: 3
    });
  }, 1000);
});

socket.on("game_update", (data) => {
  console.log("🔄 Game update:", data);
});

socket.on("game_over", (data) => {
  console.log("🏁 Game over:", data);
  socket.disconnect();
});
