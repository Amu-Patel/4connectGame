// matchmaking.js
const { createBoard } = require("./game/gameLogic");

let waitingPlayer = null;

function findMatch(socket, io, games) {
  if (!waitingPlayer) {
    waitingPlayer = socket;
    socket.emit("waiting");
    console.log("Player waiting:", socket.id);
  } else {
    const roomId = `room_${waitingPlayer.id}_${socket.id}`;

    const board = createBoard();
    const players = [waitingPlayer.id, socket.id];
    const turn = 0; // 0 = first player
    games[roomId] = { board, players, turn };

    io.to(waitingPlayer.id).emit("join", {
  roomId,
  board,
  turn,
  playerIndex: 0
});
io.to(socket.id).emit("join", {
  roomId,
  board,
  turn,
  playerIndex: 1
});


    console.log("Match created:", roomId);

    waitingPlayer = null;
  }
}


module.exports = { findMatch };
