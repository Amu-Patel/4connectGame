// matchmaking.js
const { createBoard } = require("./game/gameLogic");

let waitingPlayer = null;

/**
 * Finds or creates a match for a connecting socket
 */
function findMatch(socket, io, games) {
  // 🧍 First player waits
  if (!waitingPlayer) {
    waitingPlayer = socket;
    socket.emit("waiting");
    console.log("Player waiting:", socket.id);
    return;
  }

  // 👥 Second player joins → create match
  const roomId = `room_${waitingPlayer.id}_${socket.id}`;

  // 🧠 Initialize game state
  const board = createBoard(); // 6x7 array filled with null
  const players = [waitingPlayer.id, socket.id]; // index = player number
  const turn = 0; // player 0 (Red) starts

  games[roomId] = {
    board,
    players,
    turn
  };

  // 🔑 CRITICAL FIX: join BOTH sockets to the room
  waitingPlayer.join(roomId);
  socket.join(roomId);

  // 📢 Notify both players
  io.to(roomId).emit("join", {
    roomId,
    board,
    turn,
    players
  });

  console.log("Match created:", roomId);

  // Reset waiting player
  waitingPlayer = null;
}

module.exports = { findMatch };
