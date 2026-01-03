import { useEffect, useRef, useState } from "react";
import socket from "../socket";

// Disc color mapping
const getDiscColor = (cell) => {
  if (cell === "red") return "bg-red-500";
  if (cell === "yellow") return "bg-yellow-400";
  return "";
};

function GameBoard({ board, turn, youAre, roomId, bot }) {
  const prevBoard = useRef(null);
  const [animatedCell, setAnimatedCell] = useState(null);

  // Detect newly added disc for animation
  useEffect(() => {
    if (!board) return;

    if (!prevBoard.current) {
      prevBoard.current = JSON.parse(JSON.stringify(board));
      return;
    }

    let newDisc = null;

    for (let c = 0; c < 7; c++) {
      for (let r = 5; r >= 0; r--) {
        if (board[r][c] !== null && prevBoard.current[r][c] === null) {
          newDisc = { r, c };
          break;
        }
      }
      if (newDisc) break;
    }

    prevBoard.current = JSON.parse(JSON.stringify(board));

    if (newDisc) {
      requestAnimationFrame(() => {
        setAnimatedCell(newDisc);
        setTimeout(() => setAnimatedCell(null), 450);
      });
    }
  }, [board]);

  if (!board) return null;

  const isYourTurn = turn === youAre;

  const handleColumnClick = (col) => {
    if (!isYourTurn) return;
    if (board[0][col] !== null) return;
    socket.emit("move", { roomId, col });
  };

  return (
    <div className="h-screen bg-slate-900 text-white flex flex-col items-center justify-center gap-4">
      <div className="text-lg font-semibold">
        {isYourTurn ? "Your Turn" : bot && turn !== youAre ? "Bot's Turn" : "Opponent's Turn"}
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {Array.from({ length: 7 }).map((_, col) => (
          <div
            key={col}
            onClick={() => handleColumnClick(col)}
            className={`w-14 h-8 rounded-lg flex items-center justify-center
              ${
                isYourTurn && board[0][col] === null
                  ? "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                  : "bg-gray-600 cursor-not-allowed"
              }`}
          >
            ↓
          </div>
        ))}
      </div>

      {/* Game board */}
      <div className="grid grid-rows-6 grid-cols-7 gap-2 bg-blue-700 p-3 rounded-xl overflow-visible">
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isAnimating =
              animatedCell &&
              animatedCell.r === r &&
              animatedCell.c === c;

            const dropDistance = (r + 1) * 64 + 32;

            return (
              <div
                key={`${r}-${c}`}
                className="w-14 h-14 bg-white rounded-full flex items-center justify-center overflow-visible"
              >
                {cell && (
                  <div
                    className={`w-12 h-12 rounded-full ${getDiscColor(cell)} ${
                      isAnimating ? "animate-drop" : ""
                    }`}
                    style={
                      isAnimating
                        ? { "--drop-from": `-${dropDistance}px` }
                        : {}
                    }
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {bot && <div className="text-sm text-gray-300 mt-2">Playing against Bot 🤖</div>}
    </div>
  );
}

export default GameBoard;
