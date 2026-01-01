import { useEffect, useRef, useState } from "react";
import socket from "../socket";

function GameBoard({ board, turn, youAre, roomId }) {
  const prevBoard = useRef(null);
  const [animatedCell, setAnimatedCell] = useState(null);

  useEffect(() => {
    if (!board || !Array.isArray(board)) return;
    
    try {
      if (!prevBoard.current) {
        prevBoard.current = JSON.parse(JSON.stringify(board)); // Deep copy
        return;
      }

      let newCell = null;

      // find newly added disc (check from bottom to top for the column)
      for (let c = 0; c < 7 && !newCell; c++) {
        for (let r = 5; r >= 0; r--) {
          if (board[r] && Array.isArray(board[r]) && board[r][c] && !prevBoard.current[r]?.[c]) {
            newCell = { r, c };
            console.log("New disc detected at:", newCell, "value:", board[r][c]);
            break;
          }
        }
      }

      prevBoard.current = JSON.parse(JSON.stringify(board)); // Deep copy

      if (newCell) {
        // ✅ defer setState to next frame to avoid synchronous update
        requestAnimationFrame(() => {
          setAnimatedCell(newCell);
          // Clear animation after it completes
          setTimeout(() => setAnimatedCell(null), 600);
        });
      }
    } catch (error) {
      console.error("Error in board effect:", error);
    }
  }, [board]);

  if (!board) return null;

  const isYourTurn = turn === youAre;
  const turnColor = turn === 0 ? "Red" : "Yellow";

  const handleColumnClick = (col) => {
    console.log("Column clicked:", col, "isYourTurn:", isYourTurn, "roomId:", roomId);
    
    if (!isYourTurn) {
      console.log("Not your turn");
      alert("Not your turn!");
      return;
    }
    // Check if column is full
    if (!board || !board[0] || board[0][col] !== null) {
      console.log("Column is full");
      alert("Column is full!");
      return;
    }
    if (!roomId) {
      console.log("No roomId");
      alert("No room ID!");
      return;
    }
    console.log("Emitting move for column:", col, "roomId:", roomId);
    socket.emit("move", { roomId, col });
  };

  return (
    <div className="h-screen bg-slate-900 text-white flex flex-col items-center justify-center gap-4">
      <div className="text-lg font-semibold">
        {isYourTurn
          ? `Your Turn (${turnColor})`
          : `Opponent's Turn (${turnColor})`}
      </div>
      {/* Debug info */}
      <div className="text-xs text-gray-400">
        Room: {roomId} | Turn: {turn} | You: {youAre}
      </div>

      <div className="flex flex-col items-center gap-2">
        {/* Column headers - clickable */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, colIdx) => {
            const isColumnFull = board && board[0] && board[0][colIdx] !== null;
            return (
              <div
                key={`header-${colIdx}`}
                onClick={() => handleColumnClick(colIdx)}
                className={`w-14 h-8 flex items-center justify-center rounded-lg transition-all ${
                  isYourTurn && !isColumnFull
                    ? "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                    : "bg-gray-600 cursor-not-allowed"
                }`}
              >
                <span className="text-xs font-bold">↓</span>
              </div>
            );
          })}
        </div>

        {/* Game board */}
        <div className="grid grid-rows-6 grid-cols-7 gap-2 bg-blue-700 p-3 rounded-xl relative" style={{ overflow: "visible" }}>
          {board && Array.isArray(board) && board.map((row, rIdx) =>
            (Array.isArray(row) ? row : []).map((cell, cIdx) => {
              const isAnimating =
                animatedCell &&
                animatedCell.r === rIdx &&
                animatedCell.c === cIdx;

              // Calculate drop distance: from top of column header to target row
              // Each cell is 56px (w-14) + 8px gap = 64px, plus header height ~32px
              const dropDistance = (rIdx + 1) * 64 + 32;

              // Determine disc color - handle both "R"/"Y" and "Red"/"Yellow" formats
              const discColor = 
                cell === "R" || cell === "Red" 
                  ? "bg-red-500" 
                  : cell === "Y" || cell === "Yellow" 
                  ? "bg-yellow-400" 
                  : "";

              // Only render disc if cell has a value
              const hasDisc = cell && (cell === "R" || cell === "Y" || cell === "Red" || cell === "Yellow");

              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className="w-14 h-14 bg-white rounded-full flex items-center justify-center relative"
                  style={{ overflow: "visible" }}
                >
                  {hasDisc ? (
                    <div
                      className={`w-12 h-12 rounded-full ${discColor} ${
                        isAnimating ? "animate-drop" : ""
                      }`}
                      style={
                        isAnimating
                          ? {
                              "--drop-from": `-${dropDistance}px`,
                            }
                          : {}
                      }
                    />
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default GameBoard;
