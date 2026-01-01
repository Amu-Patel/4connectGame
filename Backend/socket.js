const { Server } = require("socket.io");
const { findMatch } = require("./matchmaking");
const {
  dropDisc,
  checkWin,
  checkDraw
} = require("./game/gameLogic");

const games = {};

module.exports = function (server) {
  const io = new Server(server, {
    cors: { origin: "*" }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("find_match", () => {
      findMatch(socket, io, games);
    });

    socket.on("move", ({ roomId, col }) => {
      const game = games[roomId];
      if (!game) return;

      const currentPlayerIndex = game.turn;
      const currentSocketId = game.players[currentPlayerIndex];

      if (socket.id !== currentSocketId) return;

      const symbol = currentPlayerIndex === 0 ? "R" : "Y";

      const row = dropDisc(game.board, col, symbol);
      if (row === -1) return;

      if (checkWin(game.board, symbol)) {
        io.to(roomId).emit("game_over", {
          winner: currentSocketId,
          board: game.board
        });
        delete games[roomId];
        return;
      }

      if (checkDraw(game.board)) {
        io.to(roomId).emit("game_over", {
          winner: null,
          board: game.board
        });
        delete games[roomId];
        return;
      }

      game.turn = game.turn === 0 ? 1 : 0;

      io.to(roomId).emit("game_update", {
        board: game.board,
        turn: game.turn
      });
    });

    socket.on("disconnect", () => {
      for (const roomId in games) {
        if (games[roomId].players.includes(socket.id)) {
          io.to(roomId).emit("game_over", {
            winner: "opponent_left"
          });
          delete games[roomId];
        }
      }
    });
  });
};
