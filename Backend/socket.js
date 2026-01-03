const { Server } = require("socket.io");
const { findMatch } = require("./matchmaking");
const { botMove } = require("./game/bot"); 
const {
  dropDisc,
  checkWin,
  checkDraw
} = require("./game/gameLogic");

const games = {};

module.exports = function (server) {
  const io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    socket.on("find_match", () => {
      findMatch(io, socket, games);
    });

    socket.on("move", ({ roomId, col }) => {
      const game = games[roomId];
      if (!game) return;

      const playerColor = game.players[socket.id];
      if (game.turn !== playerColor) return;

      const row = dropDisc(game.board, col, playerColor);
      if (row === -1) return;

      if (checkWin(game.board, playerColor)) {
        io.to(roomId).emit("game_over", {
          winner: socket.id,
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

      game.turn = playerColor === "red" ? "yellow" : "red";

      io.to(roomId).emit("game_update", {
        board: game.board,
        turn: game.turn
      });

      // 🤖 SMART BOT MOVE
      if (game.isBotGame && game.turn === "yellow") {
        const botCol = botMove(game.board);
        if (botCol === null) return;

        dropDisc(game.board, botCol, "yellow");

        if (checkWin(game.board, "yellow")) {
          io.to(roomId).emit("game_over", {
            winner: "BOT",
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

        game.turn = "red";
        io.to(roomId).emit("game_update", {
          board: game.board,
          turn: "red"
        });
      }
    });

    socket.on("disconnect", () => {
      for (const roomId in games) {
        if (games[roomId].players[socket.id]) {
          io.to(roomId).emit("game_over", {
            winner: "opponent_left"
          });
          delete games[roomId];
        }
      }
    });
  });
};
