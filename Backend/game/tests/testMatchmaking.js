let waitingPlayer = null;

function findMatch(socket, io) {
  if (!waitingPlayer) {
    waitingPlayer = socket;
    socket.emit("waiting");
  } else {
    const roomId = `room_${waitingPlayer.id}_${socket.id}`;

    waitingPlayer.join(roomId);
    socket.join(roomId);

    io.to(roomId).emit("join", { roomId });

    waitingPlayer = null;
  }
}

module.exports = { findMatch };
