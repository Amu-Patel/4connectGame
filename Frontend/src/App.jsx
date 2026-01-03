// import { useEffect, useState } from "react";
// import socket from "./socket";
// import GameBoard from "./components/GameBoard";

// function App() {
//   const [roomId, setRoomId] = useState(null);
//   const [board, setBoard] = useState(null);
//   const [turn, setTurn] = useState(null);
//   const [waiting, setWaiting] = useState(false);
//   const [youAre, setYouAre] = useState(null);
//   const [bot, setBot] = useState(false);

//   useEffect(() => {
//     socket.on("waiting", () => setWaiting(true));

//     socket.on("join", ({ roomId, board, turn, players, bot = false }) => {
//       setRoomId(roomId);
//       setBoard(board || Array.from({ length: 6 }, () => Array(7).fill(null)));
//       setTurn(turn);
//       setYouAre(players[socket.id]);
//       setWaiting(false);
//       setBot(bot);
//     });

//     socket.on("game_update", ({ board, turn }) => {
//       setBoard(board);
//       setTurn(turn);
//     });

//     socket.on("game_over", ({ winner }) => {
//       if (winner === null) alert("Draw!");
//       else if (winner === "opponent_left") alert("Opponent left!");
//       else alert(winner === socket.id ? "You Win!" : winner === "BOT" ? "Bot Wins!" : "You Lose!");
//       window.location.reload();
//     });

//     return () => {
//       socket.off("waiting");
//       socket.off("join");
//       socket.off("game_update");
//       socket.off("game_over");
//     };
//   }, []);

//   const findMatch = () => socket.emit("find_match");

//   if (!roomId) {
//     return (
//       <div className="h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
//         <h1 className="text-4xl font-bold mb-6">4 in a Row</h1>
//         {waiting ? (
//           <p className="text-xl">Waiting for opponent...</p>
//         ) : (
//           <button
//             onClick={findMatch}
//             className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg"
//           >
//             Find Match
//           </button>
//         )}
//       </div>
//     );
//   }

//   return <GameBoard board={board} turn={turn} youAre={youAre} roomId={roomId} bot={bot} />;
// }

// export default App;

import { useEffect, useState } from "react";
import socket from "./socket";
import GameBoard from "./components/GameBoard";

const EMPTY_BOARD = () =>
  Array.from({ length: 6 }, () => Array(7).fill(null));

function App() {
  const [roomId, setRoomId] = useState(null);
  const [board, setBoard] = useState(null);
  const [turn, setTurn] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [youAre, setYouAre] = useState(null);
  const [isBotGame, setIsBotGame] = useState(false);

  useEffect(() => {
    /* ===== Waiting ===== */
    socket.on("waiting", () => {
      setWaiting(true);
    });

    /* ===== Join Game ===== */
    socket.on("join", ({ roomId, board, turn, players, bot }) => {
      setRoomId(roomId);
      setBoard(board || EMPTY_BOARD());
      setTurn(turn);
      setYouAre(players?.[socket.id] || null);
      setIsBotGame(!!bot);
      setWaiting(false);
    });

    /* ===== Game Update ===== */
    socket.on("game_update", ({ board, turn }) => {
      setBoard(board);
      setTurn(turn);
    });

    /* ===== Opponent Events ===== */
    socket.on("opponent_disconnected", ({ message }) => {
      alert(message);
    });

    socket.on("opponent_reconnected", ({ message }) => {
      alert(message);
    });

    /* ===== Game Over ===== */
    socket.on("game_over", ({ winner }) => {
      if (winner === null) alert("Draw!");
      else if (winner === "BOT") alert("Bot wins!");
      else if (winner === "opponent_left") alert("Opponent left!");
      else alert(winner === socket.id ? "You Win!" : "You Lose!");

      // resetGame();
    });

    return () => {
      socket.off("waiting");
      socket.off("join");
      socket.off("game_update");
      socket.off("game_over");
      socket.off("opponent_disconnected");
      socket.off("opponent_reconnected");
    };
  }, []);

  const resetGame = () => {
    setRoomId(null);
    setBoard(null);
    setTurn(null);
    setYouAre(null);
    setIsBotGame(false);
    setWaiting(false);
  };

  useEffect(() => {
  socket.on("game_over", () => {
    resetGame(); // ✅ no error
  });
  }, []);

  /* ===== Find Match ===== */
  const findMatch = () => {
    socket.emit("find_match");
  };

  /* ===== Lobby Screen ===== */
  if (!roomId) {
    return (
      <div className="h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-6">4 in a Row</h1>

        {waiting ? (
          <p className="text-xl animate-pulse">
            Waiting for opponent...
          </p>
        ) : (
          <button
            onClick={findMatch}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Find Match
          </button>
        )}
      </div>
    );
  }

  /* ===== Game Screen ===== */
  return (
    <GameBoard
      board={board}
      turn={turn}
      youAre={youAre}
      roomId={roomId}
      bot={isBotGame}
    />
  );
}

export default App;
