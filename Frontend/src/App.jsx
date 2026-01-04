import { useEffect, useState } from "react";
import socket from "./socket";
import GameBoard from "./components/GameBoard";
import Leaderboard from "./components/Leaderboard";
import RegisterUser from "./components/RegisterUser";

const EMPTY_BOARD = () =>
  Array.from({ length: 6 }, () => Array(7).fill(null));

function App() {
  const [username, setUsername] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [board, setBoard] = useState(null);
  const [turn, setTurn] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [youAre, setYouAre] = useState(null);
  const [isBotGame, setIsBotGame] = useState(false);

  const resetGame = () => {
    setRoomId(null);
    setBoard(null);
    setTurn(null);
    setYouAre(null);
    setIsBotGame(false);
    setWaiting(false);
  };

  useEffect(() => {
    if (!username) return;

    socket.emit("registerUser", username);

    const onWaiting = () => setWaiting(true);

    const onJoin = ({ roomId, board, turn, players, bot }) => {
      setRoomId(roomId);
      setBoard(board || EMPTY_BOARD());
      setTurn(turn);
      setYouAre(players?.[socket.id] || null);
      setIsBotGame(!!bot);
      setWaiting(false);
    };
    const onGameUpdate = ({ board, turn }) => {
      setBoard(board);
      setTurn(turn);
    };
    const onGameOver = ({ winner }) => {
      if (winner === null) alert("Draw!");
      else if (winner === "BOT") alert("Bot wins!");
      else alert(winner === socket.id ? "You Win!" : "You Lose!");
      resetGame();
    };
    socket.on("waiting", onWaiting);
    socket.on("join", onJoin);
    socket.on("game_update", onGameUpdate);
    socket.on("game_over", onGameOver);
    socket.on("opponent_disconnected", ({ message }) => alert(message));
    socket.on("opponent_reconnected", ({ message }) => alert(message));

    return () => {
      socket.off("waiting", onWaiting);
      socket.off("join", onJoin);
      socket.off("game_update", onGameUpdate);
      socket.off("game_over", onGameOver);
      socket.off("opponent_disconnected");
      socket.off("opponent_reconnected");
    };
  }, [username]);

  const findMatch = () => socket.emit("find_match");
  if (!username) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <RegisterUser onRegistered={setUsername} />
      </div>
    );
  }

  if (!roomId) {
    return (
      <div className="h-screen bg-slate-900 text-white flex flex-col items-center justify-center gap-6">
        <h1 className="text-4xl font-bold">4 in a Row</h1>

        <Leaderboard />

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

  return (
    <div className="flex gap-6 p-6 bg-slate-900 min-h-screen text-white">
      <GameBoard
        board={board}
        turn={turn}
        youAre={youAre}
        roomId={roomId}
        bot={isBotGame}
      />
      <Leaderboard />
    </div>
  );
}

export default App;
