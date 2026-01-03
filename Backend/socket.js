// const { Server } = require("socket.io");
// const { findMatch } = require("./matchmaking");
// const { botMove } = require("./game/bot"); 
// const {
//   dropDisc,
//   checkWin,
//   checkDraw
// } = require("./game/gameLogic");

// const games = {};

// module.exports = function (server) {
//   const io = new Server(server, { cors: { origin: "*" } });

//   io.on("connection", (socket) => {
//     console.log("Connected:", socket.id);

//     socket.on("find_match", () => {
//       findMatch(io, socket, games);
//     });

//     socket.on("move", ({ roomId, col }) => {
//       const game = games[roomId];
//       if (!game) return;

//       const playerColor = game.players[socket.id];
//       if (game.turn !== playerColor) return;

//       const row = dropDisc(game.board, col, playerColor);
//       if (row === -1) return;

//       if (checkWin(game.board, playerColor)) {
//         io.to(roomId).emit("game_over", {
//           winner: socket.id,
//           board: game.board
//         });
//         delete games[roomId];
//         return;
//       }

//       if (checkDraw(game.board)) {
//         io.to(roomId).emit("game_over", {
//           winner: null,
//           board: game.board
//         });
//         delete games[roomId];
//         return;
//       }

//       game.turn = playerColor === "red" ? "yellow" : "red";

//       io.to(roomId).emit("game_update", {
//         board: game.board,
//         turn: game.turn
//       });

//       // 🤖 SMART BOT MOVE
//       if (game.isBotGame && game.turn === "yellow") {
//         const botCol = botMove(game.board);
//         if (botCol === null) return;

//         dropDisc(game.board, botCol, "yellow");

//         if (checkWin(game.board, "yellow")) {
//           io.to(roomId).emit("game_over", {
//             winner: "BOT",
//             board: game.board
//           });
//           delete games[roomId];
//           return;
//         }

//         if (checkDraw(game.board)) {
//           io.to(roomId).emit("game_over", {
//             winner: null,
//             board: game.board
//           });
//           delete games[roomId];
//           return;
//         }

//         game.turn = "red";
//         io.to(roomId).emit("game_update", {
//           board: game.board,
//           turn: "red"
//         });
//       }
//     });

//     socket.on("disconnect", () => {
//       for (const roomId in games) {
//         if (games[roomId].players[socket.id]) {
//           io.to(roomId).emit("game_over", {
//             winner: "opponent_left"
//           });
//           delete games[roomId];
//         }
//       }
//     });
//   });
// };

import { Server } from "socket.io";
import { findMatch } from "./matchmaking.js";
import { dropDisc, checkWin, checkDraw } from "./game/gameLogic.js";
import { botMove } from "./game/bot.js";

const activeGames = {}; // store all ongoing games

export default function (server) {
  const io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    /* ======== Find Match ======== */
    socket.on("find_match", () => findMatch(io, socket, activeGames));

    /* ======== Handle Move ======== */
    socket.on("move", ({ roomId, col }) => {
      const game = activeGames[roomId];
      if (!game) return;

      const playerColor = game.players[socket.id];
      if (game.turn !== playerColor) return; // not your turn

      const row = dropDisc(game.board, col, playerColor);
      if (row === -1) return;

      // Check win
      if (checkWin(game.board, playerColor)) {
        io.to(roomId).emit("game_over", {
          winner: socket.id,
          board: game.board,
        });
        delete activeGames[roomId];
        return;
      }

      // Check draw
      if (checkDraw(game.board)) {
        io.to(roomId).emit("game_over", {
          winner: null,
          board: game.board,
        });
        delete activeGames[roomId];
        return;
      }

      // Switch turn
      game.turn = playerColor === "red" ? "yellow" : "red";

      io.to(roomId).emit("game_update", {
        board: game.board,
        turn: game.turn,
      });

      // Bot move if bot game
      if (game.isBotGame && game.turn === "yellow") {
        setTimeout(() => botMakeMove(io, roomId), 500); // slight delay for UX
      }
    });

    /* ======== Disconnect ======== */
    socket.on("disconnect", () => {
      for (const roomId in activeGames) {
        const game = activeGames[roomId];
        if (!game.players[socket.id]) continue;

        if (game.isBotGame) {
          io.to(roomId).emit("game_over", { winner: "BOT" });
          delete activeGames[roomId];
        } else {
          const opponentId = Object.keys(game.players).find(id => id !== socket.id);

          io.to(opponentId).emit("opponent_disconnected", {
            message: "Opponent disconnected! 30s to reconnect.",
          });

          game.lastSeen = game.lastSeen || {};
          game.lastSeen[socket.id] = Date.now();

          game.disconnectTimer = setTimeout(() => {
            io.to(roomId).emit("game_over", { winner: opponentId });
            delete activeGames[roomId];
          }, 30000);
        }
      }
    });

    /* ======== Reconnect ======== */
    socket.on("reconnect_game", () => {
      for (const roomId in activeGames) {
        const game = activeGames[roomId];
        if (!game.players[socket.id]) continue;

        if (game.disconnectTimer) {
          clearTimeout(game.disconnectTimer);
          game.disconnectTimer = null;
        }

        socket.join(roomId);

        socket.emit("join", {
          roomId,
          board: game.board,
          turn: game.turn,
          players: game.players,
        });

        const opponentId = Object.keys(game.players).find(id => id !== socket.id);
        io.to(opponentId).emit("opponent_reconnected", {
          message: "Opponent reconnected!",
        });
      }
    });
  });

  /* ======== Bot Move Helper ======== */
  function botMakeMove(io, roomId) {
    const game = activeGames[roomId];
    if (!game) return;

    const col = botMove(game.board);
    dropDisc(game.board, col, "yellow");

    if (checkWin(game.board, "yellow")) {
      io.to(roomId).emit("game_over", { winner: "BOT", board: game.board });
      delete activeGames[roomId];
      return;
    }

    if (checkDraw(game.board)) {
      io.to(roomId).emit("game_over", { winner: null, board: game.board });
      delete activeGames[roomId];
      return;
    }

    game.turn = "red";

    io.to(roomId).emit("game_update", {
      board: game.board,
      turn: game.turn,
    });
  }
}
