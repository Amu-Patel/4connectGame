import { Server } from "socket.io";
import Player from "./models/Player.js";
import { findMatch } from "./matchmaking.js";
import { dropDisc, checkWin, checkDraw } from "./game/gameLogic.js";
import { botMove } from "./game/bot.js";

const activeGames = {}; // in-memory games

export default function setupSocket(server) {
  const io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("registerUser", async (username) => {
      try {
        if (!username) return;
        const clean = username.trim().toLowerCase();
        let player = await Player.findOne({ username: clean });
        if (!player) {
          player = await Player.create({ username: clean });
        }
        socket.data.username = clean;
        console.log(`Registered user: ${clean}`);
        await emitLeaderboard(io);
      } catch (err) {
        console.error("registerUser error:", err.message);
      }
    });

    socket.on("find_match", () => {
      findMatch(io, socket, activeGames);
    });

    socket.on("move", async ({ roomId, col }) => {
      const game = activeGames[roomId];
      if (!game) return;

      const color = game.players[socket.id];
      if (game.turn !== color) return;

      const row = dropDisc(game.board, col, color);
      if (row === -1) return;

      if (checkWin(game.board, color)) {
        io.to(roomId).emit("game_over", {
          winner: socket.id,
          board: game.board,
        });

        await handleWin(socket);
        await emitLeaderboard(io);

        delete activeGames[roomId];
        return;
      }

      if (checkDraw(game.board)) {
        io.to(roomId).emit("game_over", {
          winner: null,
          board: game.board,
        });
        delete activeGames[roomId];
        return;
      }
      game.turn = color === "red" ? "yellow" : "red";

      io.to(roomId).emit("game_update", {
        board: game.board,
        turn: game.turn,
      });

      if (game.isBotGame && game.turn === "yellow") {
        setTimeout(() => botMakeMove(io, roomId), 500);
      }
    });

    socket.on("disconnect", () => {
      console.log("Disconnected:", socket.id);

      for (const roomId in activeGames) {
        const game = activeGames[roomId];
        if (!game.players[socket.id]) continue;

        if (game.isBotGame) {
          io.to(roomId).emit("game_over", { winner: "BOT" });
          delete activeGames[roomId];
        } else {
          const opponentId = Object.keys(game.players)
            .find(id => id !== socket.id);

          io.to(opponentId).emit("opponent_disconnected", {
            message: "Opponent disconnected! 30s to reconnect.",
          });

          game.disconnectTimer = setTimeout(() => {
            io.to(roomId).emit("game_over", {
              winner: opponentId,
            });
            delete activeGames[roomId];
          }, 30000);
        }
      }
    });

    socket.on("reconnect_game", () => {
      for (const roomId in activeGames) {
        const game = activeGames[roomId];
        if (!game.players[socket.id]) continue;

        clearTimeout(game.disconnectTimer);
        socket.join(roomId);

        socket.emit("join", {
          roomId,
          board: game.board,
          turn: game.turn,
          players: game.players,
        });

        const opponentId = Object.keys(game.players)
          .find(id => id !== socket.id);

        io.to(opponentId).emit("opponent_reconnected", {
          message: "Opponent reconnected!",
        });
      }
    });
  });

  function botMakeMove(io, roomId) {
    const game = activeGames[roomId];
    if (!game) return;

    const col = botMove(game.board);
    dropDisc(game.board, col, "yellow");

    if (checkWin(game.board, "yellow")) {
      io.to(roomId).emit("game_over", { winner: "BOT" });
      delete activeGames[roomId];
      return;
    }

    if (checkDraw(game.board)) {
      io.to(roomId).emit("game_over", { winner: null });
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

async function handleWin(socket) {
  if (!socket.data.username) return;

  await Player.updateOne(
    { username: socket.data.username },
    { $inc: { wins: 1 } }
  );
}

async function emitLeaderboard(io) {
  const leaderboard = await Player.find()
    .sort({ wins: -1 })
    .limit(10)
    .select("username wins -_id");
  io.emit("leaderboardUpdate", leaderboard);
}
