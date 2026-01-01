import { useEffect, useState } from "react";
import socket from "./socket";
import GameBoard from "./components/GameBoard";

function App() {
  const [roomId, setRoomId] = useState(null);
  const [board, setBoard] = useState(null);
  const [turn, setTurn] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [youAre, setYouAre] = useState(null); // 0 or 1

  useEffect(() => {
    // Waiting for opponent
    socket.on("waiting", () => setWaiting(true));

    // Join a match
    socket.on("join", ({ roomId, board, turn, playerIndex }) => {
      setRoomId(roomId);
      setBoard(board);
      setTurn(turn);         // 0 or 1
      setYouAre(playerIndex); // 0 or 1
      setWaiting(false);
    });

    // Update board after each move
    socket.on("game_update", ({ board, turn }) => {
      console.log("Game update received! Board:", board, "Turn:", turn);
      setBoard(board);
      setTurn(turn);
    });

    // Game over
    socket.on("game_over", ({ winner }) => {
      if (winner === null) alert("Draw!");
      else if (winner === "opponent_left") alert("Opponent left!");
      else alert(winner === socket.id ? "You Win!" : "You Lose!");
      window.location.reload();
    });

    return () => {
      socket.off("waiting");
      socket.off("join");
      socket.off("game_update");
      socket.off("game_over");
    };
  }, []);

  const findMatch = () => socket.emit("find_match");

  // ---------------- UI ----------------
  if (!roomId) {
    return (
      <div className="h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-6">4 in a Row</h1>
        {waiting ? (
          <p className="text-xl">Waiting for opponent...</p>
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

  return (
    <GameBoard
      board={board}
      turn={turn}
      roomId={roomId}
      youAre={youAre}
    />
  );
}

export default App;
