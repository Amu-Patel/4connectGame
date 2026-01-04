import { useEffect, useRef, useState } from "react";
import socket from "../socket";
const getDiscColor = (cell) => {
  if (cell === "red") return "bg-red-500";
  if (cell === "yellow") return "bg-yellow-400";
  return "";
};
function GameBoard({ board, turn, youAre, roomId, bot }) {
  const prevBoard = useRef(null);
  const [animatedCell, setAnimatedCell] = useState(null);
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
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center px-2 sm:px-4 gap-3">
      <div className="text-base sm:text-lg font-semibold">
        {isYourTurn
          ? "Your Turn"
          : bot && turn !== youAre
          ? "Bot's Turn"
          : "Opponent's Turn"}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {Array.from({ length: 7 }).map((_, col) => (
          <div
            key={col}
            onClick={() => handleColumnClick(col)}
            className={`flex items-center justify-center rounded-md
              w-8 h-6 sm:w-12 sm:h-8 md:w-14 md:h-8
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
      <div className="grid grid-rows-6 grid-cols-7 gap-1 sm:gap-2 bg-blue-700 p-2 sm:p-3 rounded-xl">
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isAnimating =
              animatedCell &&
              animatedCell.r === r &&
              animatedCell.c === c;
            return (
              <div
                key={`${r}-${c}`}
                className="
                  bg-white rounded-full flex items-center justify-center
                  w-8 h-8
                  sm:w-12 sm:h-12
                  md:w-14 md:h-14
                "
              >
                {cell && (
                  <div
                    className={`
                      rounded-full ${getDiscColor(cell)}
                      w-6 h-6
                      sm:w-10 sm:h-10
                      md:w-12 md:h-12
                      ${isAnimating ? "animate-drop" : ""}
                    `}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {bot && (
        <div className="text-xs sm:text-sm text-gray-300">
          Playing against Bot 🤖
        </div>
      )}
    </div>
  );
}
export default GameBoard;
