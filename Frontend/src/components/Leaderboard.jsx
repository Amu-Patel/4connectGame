import { useEffect, useState } from "react";
import socket from "../socket";
function Leaderboard({ currentUser }) {
  const [leaders, setLeaders] = useState([]);
  useEffect(() => {
    socket.on("leaderboardUpdate", setLeaders);
    return () => socket.off("leaderboardUpdate");
  }, []);
  return (
    <div className="bg-gray-900 rounded-2xl p-4 shadow-xl w-full max-w-sm">
      <h2 className="text-center font-bold mb-3 text-lg">🏆 Leaderboard</h2>
      {leaders.length === 0 && (
        <p className="text-center text-sm text-gray-400">
          No games played yet
        </p>
      )}
      {leaders.slice(0, 5).map((player, index) => {
        const isYou = player.username === currentUser;
        const isWinner = index === 0; // Top player
        return (
          <div
            key={player.username}
            className={`
              flex justify-between items-center px-4 py-3 rounded-lg mb-2
              transition-all duration-200
              ${
                isWinner
                  ? "bg-yellow-500/20 border border-yellow-400 shadow-yellow-400/40"
                  : isYou
                  ? "bg-blue-600/30 border border-blue-400"
                  : "bg-gray-800"
              }
            `}
          >
            <span className="flex items-center gap-2 font-medium truncate">
              {isWinner && "👑"}
              {index === 1 && "🥈"}
              {index === 2 && "🥉"}
              {player.username}
              {isYou && " (You)"}
            </span>
            <span
              className={`
                font-bold
                ${isWinner ? "text-yellow-300" : "text-yellow-400"}
              `}
            >
              {player.wins}
            </span>
          </div>
        );
      })}
    </div>
  );
}
export default Leaderboard;
