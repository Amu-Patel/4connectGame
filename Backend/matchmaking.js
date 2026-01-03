// matchmaking.js
import { createBoard } from "./game/gameLogic.js";

let waitingPlayer = null;

export function findMatch(io, socket, games) {
  // If no one waiting → wait for 10 seconds, then start bot
  if (!waitingPlayer) {
    waitingPlayer = socket;
    socket.emit("waiting");

    setTimeout(() => {
      if (waitingPlayer === socket) {
        startBotGame(io, socket, games);
        waitingPlayer = null;
      }
    }, 10000);

    return;
  }

  // Human vs Human
  startHumanGame(io, waitingPlayer, socket, games);
  waitingPlayer = null;
}

function startHumanGame(io, p1, p2, games) {
  const roomId = `room_${p1.id}_${p2.id}`;

  games[roomId] = {
    board: createBoard(),
    players: {
      [p1.id]: "red",
      [p2.id]: "yellow"
    },
    turn: "red",
    isBotGame: false
  };

  p1.join(roomId);
  p2.join(roomId);

  io.to(roomId).emit("join", {
    roomId,
    players: games[roomId].players,
    turn: "red"
  });
}

function startBotGame(io, socket, games) {
  const roomId = `room_${socket.id}_BOT`;

  games[roomId] = {
    board: createBoard(),
    players: {
      [socket.id]: "red",
      BOT: "yellow"
    },
    turn: "red",
    isBotGame: true
  };

  socket.join(roomId);

  socket.emit("join", {
    roomId,
    players: games[roomId].players,
    turn: "red",
    bot: true
  });
}
